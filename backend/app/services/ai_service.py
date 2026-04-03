import json
import re
import logging
from typing import Optional, AsyncGenerator
from openai import AsyncOpenAI

from app.config import settings
from app.core.prompts import get_system_prompt, build_rag_prompt

logger = logging.getLogger(__name__)

_client: Optional[AsyncOpenAI] = None


def get_openrouter_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_BASE_URL,
            default_headers={
                "HTTP-Referer": "https://oms-intelligence.app",
                "X-Title": "OMS Intelligence v2",
            },
        )
    return _client


async def chat_completion(
    message: str,
    role: str,
    conversation_history: list,
    rag_context: str = "",
    model: Optional[str] = None,
) -> tuple[str, int, bool]:
    client = get_openrouter_client()
    system_prompt = get_system_prompt(role)
    messages = build_rag_prompt(system_prompt, rag_context, conversation_history)
    messages.append({"role": "user", "content": message})

    try:
        response = await client.chat.completions.create(
            model=model or settings.OPENROUTER_MODEL,
            messages=messages,
            max_tokens=500,
            temperature=0.3,
        )
        content = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else 0
        rag_used = bool(rag_context)
        return content, tokens, rag_used
    except Exception as e:
        logger.error(f"OpenRouter chat error: {e}")
        raise


def extract_chart_data(response_text: str) -> tuple[str, Optional[dict]]:
    pattern = r"CHART_DATA:\s*(\{.*?\})\s*$"
    match = re.search(pattern, response_text, re.DOTALL)
    if match:
        try:
            chart_data = json.loads(match.group(1))
            clean_text = response_text[: match.start()].strip()
            return clean_text, chart_data
        except json.JSONDecodeError:
            pass
    return response_text, None


async def detect_language(text: str) -> str:
    client = get_openrouter_client()
    try:
        response = await client.chat.completions.create(
            model=settings.OPENROUTER_FAST_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Detect the language of this text and reply with ONLY the ISO 639-1 "
                        f"two-letter language code (e.g. 'en', 'hi', 'mr'). "
                        f"Text: {text[:200]}"
                    ),
                }
            ],
            max_tokens=5,
            temperature=0,
        )
        code = response.choices[0].message.content.strip().lower()[:2]
        return code if code.isalpha() else "en"
    except Exception:
        return "en"