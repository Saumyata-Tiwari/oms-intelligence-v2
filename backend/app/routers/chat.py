import uuid
import logging
from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import ChatSession, ChatMessage, UserRole, Channel, SentimentLabel
from app.schemas import ChatRequest, ChatResponse, SessionResponse, WhatsAppInbound, SentimentResult
from app.services.ai_service import chat_completion, detect_language, extract_chart_data
from app.services.sentiment_service import analyze_sentiment, should_escalate
from app.services.rag_service import get_rag_context
from app.services.n8n_service import trigger_escalation
from app.core.security import get_optional_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


async def _get_or_create_session(session_id, channel, role, user_id, db):
    result = await db.execute(select(ChatSession).where(ChatSession.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        session = ChatSession(session_id=session_id, channel=channel, role=role, user_id=user_id)
        db.add(session)
        await db.flush()
    return session


async def _get_conversation_history(session_id, db, limit=10):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    return [{"role": m.role, "content": m.content} for m in messages]


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    session_id = request.session_id or str(uuid.uuid4())
    user_id = current_user.id if current_user else request.user_id
    session = await _get_or_create_session(session_id, request.channel, request.role, user_id, db)
    sentiment_result = await analyze_sentiment(request.message)
    language = await detect_language(request.message)
    session.detected_language = language
    rag_context = await get_rag_context(request.message)
    history = await _get_conversation_history(session_id, db)
    raw_response, tokens_used, rag_used = await chat_completion(
        message=request.message,
        role=request.role.value,
        conversation_history=history,
        rag_context=rag_context,
    )
    clean_response, chart_data = extract_chart_data(raw_response)

    recent_sentiments = []
    try:
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id, ChatMessage.role == "user")
            .order_by(ChatMessage.created_at.desc())
            .limit(3)
        )
        recent_sentiments = [
            {"label": m.sentiment_label, "score": m.sentiment_score or 0.0}
            for m in result.scalars().all()
            if m.sentiment_label
        ]
    except Exception:
        pass

    escalated, escalation_reason = should_escalate(recent_sentiments, sentiment_result["label"])
    if escalated and not session.escalated:
        session.escalated = True
        session.escalation_reason = escalation_reason
        last_msgs = [m["content"] for m in history[-3:]] + [request.message]
        background_tasks.add_task(
            trigger_escalation,
            session_id=session_id,
            channel=request.channel.value,
            customer_id=str(user_id or "anonymous"),
            reason=escalation_reason,
            last_messages=last_msgs,
        )

    db.add(ChatMessage(
        session_id=session_id, role="user", content=request.message,
        language=language, sentiment_label=SentimentLabel(sentiment_result["label"]),
        sentiment_score=sentiment_result["score"],
    ))
    db.add(ChatMessage(
        session_id=session_id, role="assistant", content=clean_response,
        language=language, tokens_used=tokens_used, rag_context_used=rag_used, chart_data=chart_data,
    ))

    all_scores = recent_sentiments + [{"score": sentiment_result["score"]}]
    session.avg_sentiment_score = sum(s["score"] for s in all_scores) / len(all_scores)
    await db.flush()

    return ChatResponse(
        session_id=session_id, response=clean_response, language=language,
        sentiment=SentimentResult(**sentiment_result), chart_data=chart_data,
        escalated=escalated, tokens_used=tokens_used, rag_context_used=rag_used,
    )


@router.post("/whatsapp", include_in_schema=False)
async def whatsapp_inbound(
    payload: WhatsAppInbound,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    phone = payload.From.replace("whatsapp:", "")
    session_id = f"wa_{phone.replace('+', '')}"
    chat_req = ChatRequest(
        message=payload.Body, session_id=session_id,
        role=UserRole.STORE_ASSOCIATE, channel=Channel.WHATSAPP,
    )
    chat_response = await chat(chat_req, background_tasks, db, current_user=None)
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>{chat_response.response[:1600]}</Message></Response>"""
    return PlainTextResponse(twiml, media_type="application/xml")


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    result = await db.execute(select(ChatSession).where(ChatSession.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    msgs_result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    )
    session.messages = list(msgs_result.scalars().all())
    return session