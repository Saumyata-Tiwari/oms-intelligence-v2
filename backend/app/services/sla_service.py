from datetime import datetime, timedelta
from typing import Optional

SLA_HOURS = {
    "pending": 24,
    "confirmed": 48,
    "processing": 72,
    "shipped": 120,
}

RISK_THRESHOLD_HOURS = 6


def calculate_sla_deadline(order_time: datetime, status: str) -> datetime:
    hours = SLA_HOURS.get(status, 48)
    return order_time + timedelta(hours=hours)


def get_sla_status(deadline: datetime) -> str:
    now = datetime.utcnow()
    remaining = (deadline - now).total_seconds() / 3600
    if remaining < 0:
        return "breached"
    elif remaining <= RISK_THRESHOLD_HOURS:
        return "at_risk"
    return "on_time"


def predict_delivery_risk(
    ordered_at: datetime,
    current_status: str,
    estimated_delivery: Optional[datetime] = None,
) -> dict:
    now = datetime.utcnow()
    deadline = calculate_sla_deadline(ordered_at, current_status)
    sla_status = get_sla_status(deadline)
    hours_remaining = max(0, (deadline - now).total_seconds() / 3600)

    risk_score = 0.0
    if sla_status == "breached":
        risk_score = 1.0
    elif sla_status == "at_risk":
        risk_score = 0.75
    else:
        max_hours = SLA_HOURS.get(current_status, 48)
        risk_score = max(0.0, 1.0 - (hours_remaining / max_hours))

    return {
        "sla_status": sla_status,
        "sla_deadline": deadline.isoformat(),
        "hours_remaining": round(hours_remaining, 1),
        "risk_score": round(risk_score, 3),
        "should_alert": sla_status in ("at_risk", "breached"),
    }