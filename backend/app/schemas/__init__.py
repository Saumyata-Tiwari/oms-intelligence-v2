from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field
from app.models import (
    UserRole, OrderStatus, Channel, SLAStatus,
    SentimentLabel, AlertType
)


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    role: UserRole = UserRole.STORE_ASSOCIATE


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    preferred_language: str
    created_at: datetime
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    username: str
    password: str


class OrderItemSchema(BaseModel):
    product_title: str
    sku: Optional[str] = None
    quantity: int
    price: float
    vendor: Optional[str] = None
    model_config = {"from_attributes": True}


class OrderBase(BaseModel):
    external_id: str
    source_channel: Channel = Channel.SHOPIFY
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    status: OrderStatus = OrderStatus.PENDING
    total_price: float = 0.0
    currency: str = "INR"


class OrderCreate(OrderBase):
    items: List[OrderItemSchema] = []
    raw_data: Optional[dict] = None
    shipping_address: Optional[dict] = None
    ordered_at: Optional[datetime] = None


class OrderResponse(OrderBase):
    id: int
    item_count: int
    sla_status: SLAStatus
    sla_deadline: Optional[datetime]
    tracking_number: Optional[str]
    estimated_delivery: Optional[datetime]
    ordered_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime
    items: List[OrderItemSchema] = []
    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: Optional[str] = None
    role: UserRole = UserRole.STORE_ASSOCIATE
    channel: Channel = Channel.WEB
    user_id: Optional[int] = None


class SentimentResult(BaseModel):
    label: SentimentLabel
    score: float
    confidence: float


class ChatResponse(BaseModel):
    session_id: str
    response: str
    language: str
    sentiment: SentimentResult
    chart_data: Optional[dict] = None
    escalated: bool = False
    tokens_used: Optional[int] = None
    rag_context_used: bool = False


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    language: str
    sentiment_label: Optional[SentimentLabel]
    sentiment_score: Optional[float]
    chart_data: Optional[dict]
    created_at: datetime
    model_config = {"from_attributes": True}


class SessionResponse(BaseModel):
    session_id: str
    channel: Channel
    role: UserRole
    detected_language: str
    avg_sentiment_score: float
    escalated: bool
    started_at: datetime
    messages: List[MessageResponse] = []
    model_config = {"from_attributes": True}


class WhatsAppInbound(BaseModel):
    From: str
    To: str
    Body: str
    MessageSid: Optional[str] = None
    NumMedia: Optional[str] = "0"


class AlertResponse(BaseModel):
    id: int
    alert_type: AlertType
    order_id: Optional[int]
    title: str
    description: Optional[str]
    n8n_triggered: bool
    resolved: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class AnalyticsSummary(BaseModel):
    period: str
    total_orders: int
    pending_orders: int
    fulfilled_orders: int
    cancelled_orders: int
    revenue: float
    sla_on_time: int
    sla_at_risk: int
    sla_breached: int
    total_sessions: int
    web_sessions: int
    whatsapp_sessions: int
    avg_sentiment: float
    positive_msgs: int
    neutral_msgs: int
    negative_msgs: int
    escalations: int


class TimeSeriesPoint(BaseModel):
    timestamp: str
    value: float


class AnalyticsChartData(BaseModel):
    orders_over_time: List[TimeSeriesPoint]
    sentiment_over_time: List[TimeSeriesPoint]
    channel_split: dict
    sla_distribution: dict
    revenue_over_time: List[TimeSeriesPoint]


class ShopifyOrderWebhook(BaseModel):
    id: Any
    name: Optional[str] = None
    email: Optional[str] = None
    financial_status: Optional[str] = None
    fulfillment_status: Optional[str] = None
    total_price: Optional[str] = "0.00"
    currency: Optional[str] = "INR"
    line_items: Optional[List[dict]] = []
    shipping_address: Optional[dict] = None
    customer: Optional[dict] = None
    created_at: Optional[str] = None