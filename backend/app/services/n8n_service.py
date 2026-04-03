import logging
import httpx
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


async def _post_webhook(url: str, payload: dict) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return {"success": True, "status": response.status_code}
    except httpx.TimeoutException:
        logger.error(f"N8N webhook timeout: {url}")
        return {"success": False, "error": "timeout"}
    except Exception as e:
        logger.error(f"N8N webhook error: {e}")
        return {"success": False, "error": str(e)}


async def trigger_sla_breach(
    order_id: str,
    customer_name: str,
    customer_phone: str,
    sla_deadline: datetime,
    order_status: str,
) -> dict:
    payload = {
        "event": "sla_breach",
        "triggered_at": datetime.utcnow().isoformat(),
        "order": {
            "id": order_id,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "sla_deadline": sla_deadline.isoformat(),
            "status": order_status,
        },
    }
    return await _post_webhook(settings.N8N_SLA_BREACH_WEBHOOK, payload)


async def trigger_stockout_alert(
    product_name: str,
    sku: str,
    affected_orders: int,
    vendor: str = "",
) -> dict:
    payload = {
        "event": "stockout_risk",
        "triggered_at": datetime.utcnow().isoformat(),
        "product": {
            "name": product_name,
            "sku": sku,
            "vendor": vendor,
            "affected_orders": affected_orders,
        },
    }
    return await _post_webhook(settings.N8N_STOCKOUT_WEBHOOK, payload)


async def trigger_escalation(
    session_id: str,
    channel: str,
    customer_id: str,
    reason: str,
    last_messages: list[str],
) -> dict:
    payload = {
        "event": "escalation",
        "triggered_at": datetime.utcnow().isoformat(),
        "session": {
            "id": session_id,
            "channel": channel,
            "customer_id": customer_id,
        },
        "reason": reason,
        "last_messages": last_messages[-5:],
    }
    return await _post_webhook(settings.N8N_ESCALATION_WEBHOOK, payload)