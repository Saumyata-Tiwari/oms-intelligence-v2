import logging
from typing import Optional

logger = logging.getLogger(__name__)

_sentiment_pipeline = None
_USE_LOCAL_MODEL = False

try:
    from transformers import pipeline as hf_pipeline
    _sentiment_pipeline = hf_pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        max_length=512,
        truncation=True,
    )
    _USE_LOCAL_MODEL = True
    logger.info("✅ Local sentiment model loaded")
except Exception as e:
    logger.warning(f"⚠️ Local sentiment model unavailable ({e}). Using OpenRouter fallback.")

_LABEL_MAP = {
    "LABEL_0": ("negative", -1.0),
    "LABEL_1": ("neutral", 0.0),
    "LABEL_2": ("positive", 1.0),
    "negative": ("negative", -1.0),
    "neutral": ("neutral", 0.0),
    "positive": ("positive", 1.0),
}


async def analyze_sentiment(text: str) -> dict:
    if _USE_LOCAL_MODEL and _sentiment_pipeline:
        return _analyze_local(text)
    else:
        return await _analyze_via_llm(text)


def _analyze_local(text: str) -> dict:
    try:
        results = _sentiment_pipeline(text[:512])
        result = results[0]
        raw_label = result["label"].upper()
        label, base_score = _LABEL_MAP.get(raw_label, ("neutral", 0.0))
        confidence = result["score"]
        score = confidence * (1.0 if label == "positive" else -1.0 if label == "negative" else 0.0)
        return {"label": label, "score": round(score, 4), "confidence": round(confidence, 4)}
    except Exception as e:
        logger.error(f"Local sentiment error: {e}")
        return {"label": "neutral", "score": 0.0, "confidence": 0.5}


async def _analyze_via_llm(text: str) -> dict:
    from app.services.ai_service import get_openrouter_client
    from app.config import settings
    client = get_openrouter_client()
    try:
        response = await client.chat.completions.create(
            model=settings.OPENROUTER_FAST_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Analyze sentiment of this message. "
                        "Reply ONLY with JSON: {\"label\": \"positive|neutral|negative\", \"score\": <-1.0 to 1.0>, \"confidence\": <0.0 to 1.0>}\n\n"
                        f"Message: {text[:300]}"
                    ),
                }
            ],
            max_tokens=60,
            temperature=0,
        )
        import json, re
        raw = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        logger.error(f"LLM sentiment error: {e}")
    return {"label": "neutral", "score": 0.0, "confidence": 0.5}


def should_escalate(sentiment_history: list[dict], current_label: str) -> tuple[bool, Optional[str]]:
    if current_label == "negative":
        recent = sentiment_history[-2:] if len(sentiment_history) >= 2 else sentiment_history
        if len(recent) >= 2 and all(h.get("label") == "negative" for h in recent):
            return True, "3 consecutive negative messages"
    if sentiment_history:
        latest_score = sentiment_history[-1].get("score", 0.0)
        if latest_score < -0.85:
            return True, "High-intensity negative sentiment detected"
    return False, None