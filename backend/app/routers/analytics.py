from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Order, ChatSession, ChatMessage, OrderStatus, SLAStatus, Channel, SentimentLabel
from app.schemas import AnalyticsSummary, AnalyticsChartData, TimeSeriesPoint
from app.core.security import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def _date_from_period(period: str) -> datetime:
    now = datetime.utcnow()
    return {
        "today": now.replace(hour=0, minute=0, second=0, microsecond=0),
        "7d": now - timedelta(days=7),
        "30d": now - timedelta(days=30),
        "90d": now - timedelta(days=90),
    }.get(period, now - timedelta(days=7))


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    period: str = Query("7d", pattern="^(today|7d|30d|90d)$"),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    since = _date_from_period(period)

    order_result = await db.execute(
        select(func.count(Order.id).label("total"), func.sum(Order.total_price).label("revenue"))
        .where(Order.created_at >= since)
    )
    order_row = order_result.one()

    status_result = await db.execute(
        select(Order.status, func.count(Order.id)).where(Order.created_at >= since).group_by(Order.status)
    )
    status_map = {row[0]: row[1] for row in status_result}

    sla_result = await db.execute(
        select(Order.sla_status, func.count(Order.id)).where(Order.created_at >= since).group_by(Order.sla_status)
    )
    sla_map = {row[0]: row[1] for row in sla_result}

    channel_result = await db.execute(
        select(ChatSession.channel, func.count(ChatSession.id))
        .where(ChatSession.started_at >= since).group_by(ChatSession.channel)
    )
    channel_map = {row[0]: row[1] for row in channel_result}

    sentiment_result = await db.execute(
        select(ChatMessage.sentiment_label, func.count(ChatMessage.id))
        .where(ChatMessage.created_at >= since, ChatMessage.role == "user", ChatMessage.sentiment_label.isnot(None))
        .group_by(ChatMessage.sentiment_label)
    )
    sentiment_map = {row[0]: row[1] for row in sentiment_result}

    avg_sentiment_result = await db.execute(
        select(func.avg(ChatMessage.sentiment_score))
        .where(ChatMessage.created_at >= since, ChatMessage.role == "user", ChatMessage.sentiment_score.isnot(None))
    )
    avg_sentiment = avg_sentiment_result.scalar() or 0.0

    escalation_result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.started_at >= since, ChatSession.escalated == True)
    )
    escalation_count = escalation_result.scalar() or 0

    sessions_result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.started_at >= since)
    )
    sessions_total = sessions_result.scalar() or 0

    return AnalyticsSummary(
        period=period,
        total_orders=order_row.total or 0,
        pending_orders=status_map.get(OrderStatus.PENDING, 0),
        fulfilled_orders=status_map.get(OrderStatus.DELIVERED, 0),
        cancelled_orders=status_map.get(OrderStatus.CANCELLED, 0),
        revenue=float(order_row.revenue or 0),
        sla_on_time=sla_map.get(SLAStatus.ON_TIME, 0),
        sla_at_risk=sla_map.get(SLAStatus.AT_RISK, 0),
        sla_breached=sla_map.get(SLAStatus.BREACHED, 0),
        total_sessions=sessions_total,
        web_sessions=channel_map.get(Channel.WEB, 0),
        whatsapp_sessions=channel_map.get(Channel.WHATSAPP, 0),
        avg_sentiment=round(float(avg_sentiment), 4),
        positive_msgs=sentiment_map.get(SentimentLabel.POSITIVE, 0),
        neutral_msgs=sentiment_map.get(SentimentLabel.NEUTRAL, 0),
        negative_msgs=sentiment_map.get(SentimentLabel.NEGATIVE, 0),
        escalations=escalation_count,
    )


@router.get("/charts", response_model=AnalyticsChartData)
async def get_chart_data(
    period: str = Query("7d", pattern="^(today|7d|30d|90d)$"),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    since = _date_from_period(period)

    orders_ts_result = await db.execute(
        select(func.date_trunc("day", Order.created_at).label("day"), func.count(Order.id).label("count"))
        .where(Order.created_at >= since).group_by("day").order_by("day")
    )
    orders_ts = [TimeSeriesPoint(timestamp=str(row.day), value=float(row.count)) for row in orders_ts_result]

    revenue_ts_result = await db.execute(
        select(func.date_trunc("day", Order.created_at).label("day"), func.sum(Order.total_price).label("revenue"))
        .where(Order.created_at >= since).group_by("day").order_by("day")
    )
    revenue_ts = [TimeSeriesPoint(timestamp=str(row.day), value=float(row.revenue or 0)) for row in revenue_ts_result]

    sentiment_ts_result = await db.execute(
        select(func.date_trunc("day", ChatMessage.created_at).label("day"), func.avg(ChatMessage.sentiment_score).label("avg_score"))
        .where(ChatMessage.created_at >= since, ChatMessage.role == "user", ChatMessage.sentiment_score.isnot(None))
        .group_by("day").order_by("day")
    )
    sentiment_ts = [TimeSeriesPoint(timestamp=str(row.day), value=round(float(row.avg_score or 0), 4)) for row in sentiment_ts_result]

    channel_result = await db.execute(
        select(ChatSession.channel, func.count(ChatSession.id))
        .where(ChatSession.started_at >= since).group_by(ChatSession.channel)
    )
    channel_split = {row[0].value: row[1] for row in channel_result}

    sla_result = await db.execute(
        select(Order.sla_status, func.count(Order.id))
        .where(Order.created_at >= since).group_by(Order.sla_status)
    )
    sla_distribution = {row[0].value: row[1] for row in sla_result}

    return AnalyticsChartData(
        orders_over_time=orders_ts,
        sentiment_over_time=sentiment_ts,
        channel_split=channel_split,
        sla_distribution=sla_distribution,
        revenue_over_time=revenue_ts,
    )