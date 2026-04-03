from __future__ import annotations
from datetime import datetime
from typing import Optional
from enum import Enum as PyEnum

from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, Enum,
    ForeignKey, JSON, func, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class UserRole(str, PyEnum):
    STORE_ASSOCIATE = "store_associate"
    FULFILLMENT_MANAGER = "fulfillment_manager"
    OPS_LEAD = "ops_lead"
    ADMIN = "admin"


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Channel(str, PyEnum):
    WEB = "web"
    WHATSAPP = "whatsapp"
    SHOPIFY = "shopify"
    API = "api"


class SLAStatus(str, PyEnum):
    ON_TIME = "on_time"
    AT_RISK = "at_risk"
    BREACHED = "breached"


class SentimentLabel(str, PyEnum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class AlertType(str, PyEnum):
    SLA_BREACH = "sla_breach"
    STOCKOUT = "stockout"
    ESCALATION = "escalation"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(200))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STORE_ASSOCIATE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="user")


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    source_channel: Mapped[Channel] = mapped_column(Enum(Channel), default=Channel.SHOPIFY)
    customer_name: Mapped[Optional[str]] = mapped_column(String(200))
    customer_email: Mapped[Optional[str]] = mapped_column(String(255))
    customer_phone: Mapped[Optional[str]] = mapped_column(String(50))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_price: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    item_count: Mapped[int] = mapped_column(Integer, default=0)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON)
    sla_status: Mapped[SLAStatus] = mapped_column(Enum(SLAStatus), default=SLAStatus.ON_TIME)
    sla_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    sla_breach_alerted: Mapped[bool] = mapped_column(Boolean, default=False)
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100))
    estimated_delivery: Mapped[Optional[datetime]] = mapped_column(DateTime)
    ordered_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    shipped_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="order")
    __table_args__ = (
        Index("ix_orders_status_sla", "status", "sla_status"),
        Index("ix_orders_created_at", "created_at"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[Optional[str]] = mapped_column(String(100))
    variant_id: Mapped[Optional[str]] = mapped_column(String(100))
    product_title: Mapped[str] = mapped_column(String(500), nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    vendor: Mapped[Optional[str]] = mapped_column(String(200))
    order: Mapped["Order"] = relationship("Order", back_populates="items")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    channel: Mapped[Channel] = mapped_column(Enum(Channel), default=Channel.WEB)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STORE_ASSOCIATE)
    detected_language: Mapped[str] = mapped_column(String(10), default="en")
    avg_sentiment_score: Mapped[float] = mapped_column(Float, default=0.0)
    escalated: Mapped[bool] = mapped_column(Boolean, default=False)
    escalation_reason: Mapped[Optional[str]] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_active_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    user: Mapped[Optional["User"]] = relationship("User", back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("chat_sessions.session_id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    sentiment_label: Mapped[Optional[SentimentLabel]] = mapped_column(Enum(SentimentLabel))
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer)
    model_used: Mapped[Optional[str]] = mapped_column(String(100))
    rag_context_used: Mapped[bool] = mapped_column(Boolean, default=False)
    chart_data: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
    __table_args__ = (
        Index("ix_chat_messages_session_created", "session_id", "created_at"),
    )


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    alert_type: Mapped[AlertType] = mapped_column(Enum(AlertType), nullable=False)
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    payload: Mapped[Optional[dict]] = mapped_column(JSON)
    n8n_triggered: Mapped[bool] = mapped_column(Boolean, default=False)
    n8n_response: Mapped[Optional[dict]] = mapped_column(JSON)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    order: Mapped[Optional["Order"]] = relationship("Order", back_populates="alerts")