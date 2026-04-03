import hmac
import hashlib
import base64
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Order, OrderItem, OrderStatus, SLAStatus, Channel, User
from app.schemas import ShopifyOrderWebhook, LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.sla_service import calculate_sla_deadline, get_sla_status
from app.services.rag_service import add_to_index
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

logger = logging.getLogger(__name__)

auth_router = APIRouter(prefix="/api/auth", tags=["Auth"])
webhook_router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@auth_router.post("/register", response_model=UserResponse, status_code=201)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email, username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name, role=payload.role,
    )
    db.add(user)
    await db.flush()
    return user


@auth_router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@auth_router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


def _verify_shopify_hmac(body: bytes, hmac_header: str) -> bool:
    if not settings.SHOPIFY_WEBHOOK_SECRET:
        return True
    digest = hmac.new(
        settings.SHOPIFY_WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256
    ).digest()
    computed = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(computed, hmac_header)


def _map_shopify_status(financial: str, fulfillment: Optional[str]) -> OrderStatus:
    if fulfillment == "fulfilled":
        return OrderStatus.DELIVERED
    if fulfillment == "partial":
        return OrderStatus.SHIPPED
    if financial == "refunded":
        return OrderStatus.REFUNDED
    if financial == "voided":
        return OrderStatus.CANCELLED
    if financial in ("paid", "partially_paid"):
        return OrderStatus.CONFIRMED
    return OrderStatus.PENDING


@webhook_router.post("/shopify/orders/create")
async def shopify_order_created(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_shopify_hmac_sha256: Optional[str] = Header(None),
):
    body = await request.body()
    if x_shopify_hmac_sha256 and not _verify_shopify_hmac(body, x_shopify_hmac_sha256):
        raise HTTPException(status_code=401, detail="Invalid Shopify signature")

    import json
    data = json.loads(body)
    payload = ShopifyOrderWebhook(**data)

    existing = await db.execute(select(Order).where(Order.external_id == str(payload.id)))
    if existing.scalar_one_or_none():
        return {"status": "duplicate", "order_id": str(payload.id)}

    status = _map_shopify_status(payload.financial_status or "", payload.fulfillment_status)
    ordered_at = None
    if payload.created_at:
        try:
            ordered_at = datetime.fromisoformat(payload.created_at.replace("Z", "+00:00"))
        except Exception:
            ordered_at = datetime.utcnow()

    order = Order(
        external_id=str(payload.id),
        source_channel=Channel.SHOPIFY,
        customer_name=(payload.customer.get("first_name", "") + " " + payload.customer.get("last_name", "")).strip() if payload.customer else None,
        customer_email=payload.email,
        status=status,
        total_price=float(payload.total_price or 0),
        currency=payload.currency or "INR",
        item_count=len(payload.line_items or []),
        shipping_address=payload.shipping_address,
        raw_data=data,
        ordered_at=ordered_at,
    )

    if ordered_at:
        order.sla_deadline = calculate_sla_deadline(ordered_at, status.value)
        order.sla_status = SLAStatus(get_sla_status(order.sla_deadline))

    db.add(order)
    await db.flush()

    for item in (payload.line_items or []):
        db.add(OrderItem(
            order_id=order.id,
            product_id=str(item.get("product_id", "")),
            variant_id=str(item.get("variant_id", "")),
            product_title=item.get("title", "Unknown"),
            sku=item.get("sku"),
            quantity=item.get("quantity", 1),
            price=float(item.get("price", 0)),
            vendor=item.get("vendor"),
        ))

    import asyncio
    asyncio.create_task(add_to_index(
        f"Order {payload.id} | Status: {status.value} | Total: {order.total_price}",
        str(payload.id)
    ))

    return {"status": "created", "order_id": order.id}


@webhook_router.post("/shopify/orders/updated")
async def shopify_order_updated(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_shopify_hmac_sha256: Optional[str] = Header(None),
):
    body = await request.body()
    import json
    data = json.loads(body)
    payload = ShopifyOrderWebhook(**data)

    result = await db.execute(select(Order).where(Order.external_id == str(payload.id)))
    order = result.scalar_one_or_none()
    if not order:
        return {"status": "not_found"}

    new_status = _map_shopify_status(payload.financial_status or "", payload.fulfillment_status)
    order.status = new_status
    order.raw_data = data

    if new_status == OrderStatus.SHIPPED and not order.shipped_at:
        order.shipped_at = datetime.utcnow()
    elif new_status == OrderStatus.DELIVERED and not order.delivered_at:
        order.delivered_at = datetime.utcnow()

    if order.ordered_at:
        order.sla_deadline = calculate_sla_deadline(order.ordered_at, new_status.value)
        order.sla_status = SLAStatus(get_sla_status(order.sla_deadline))

    return {"status": "updated", "order_id": order.id}