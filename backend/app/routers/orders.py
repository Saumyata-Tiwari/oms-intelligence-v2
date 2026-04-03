from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Order, OrderItem, OrderStatus, SLAStatus
from app.schemas import OrderCreate, OrderResponse, OrderListResponse
from app.services.sla_service import calculate_sla_deadline, get_sla_status, predict_delivery_risk
from app.services.n8n_service import trigger_sla_breach
from app.core.security import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    sla_status: Optional[SLAStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    query = select(Order)
    if status:
        query = query.where(Order.status == status)
    if sla_status:
        query = query.where(Order.sla_status == sla_status)
    if search:
        query = query.where(
            Order.customer_name.ilike(f"%{search}%")
            | Order.external_id.ilike(f"%{search}%")
            | Order.customer_email.ilike(f"%{search}%")
        )
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()
    return OrderListResponse(orders=orders, total=total, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/external/{external_id}", response_model=OrderResponse)
async def get_order_by_external_id(external_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.external_id == external_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    order = Order(**payload.model_dump(exclude={"items"}), item_count=len(payload.items))
    if order.ordered_at:
        order.sla_deadline = calculate_sla_deadline(order.ordered_at, order.status.value)
        order.sla_status = SLAStatus(get_sla_status(order.sla_deadline))
    db.add(order)
    await db.flush()
    for item_data in payload.items:
        db.add(OrderItem(order_id=order.id, **item_data.model_dump()))
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: int, status: OrderStatus, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    now = datetime.utcnow()
    if status == OrderStatus.SHIPPED:
        order.shipped_at = now
    elif status == OrderStatus.DELIVERED:
        order.delivered_at = now
    if order.ordered_at:
        order.sla_deadline = calculate_sla_deadline(order.ordered_at, status.value)
        order.sla_status = SLAStatus(get_sla_status(order.sla_deadline))
    return order


@router.get("/{order_id}/sla")
async def get_order_sla(order_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return predict_delivery_risk(
        ordered_at=order.ordered_at or order.created_at,
        current_status=order.status.value,
        estimated_delivery=order.estimated_delivery,
    )


@router.post("/sla/scan", tags=["SLA"])
async def scan_sla_breaches(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    active_statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED]
    result = await db.execute(
        select(Order).where(and_(Order.status.in_(active_statuses), Order.sla_breach_alerted == False))
    )
    orders = result.scalars().all()
    breached = []
    at_risk = []
    for order in orders:
        if not order.sla_deadline:
            continue
        sla = get_sla_status(order.sla_deadline)
        order.sla_status = SLAStatus(sla)
        if sla == "breached" and not order.sla_breach_alerted:
            order.sla_breach_alerted = True
            breached.append(order.external_id)
            background_tasks.add_task(
                trigger_sla_breach,
                order_id=order.external_id,
                customer_name=order.customer_name or "Customer",
                customer_phone=order.customer_phone or "",
                sla_deadline=order.sla_deadline,
                order_status=order.status.value,
            )
        elif sla == "at_risk":
            at_risk.append(order.external_id)
    return {"scanned": len(orders), "breached": breached, "at_risk": at_risk}