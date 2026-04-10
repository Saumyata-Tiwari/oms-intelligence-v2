import json
import re
import logging
from typing import Optional
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
    # Force English — prepend language instruction to first system message
    if messages and messages[0]["role"] == "system":
        messages[0]["content"] = "IMPORTANT: Always respond in English only, regardless of any context language.\n\n" + messages[0]["content"]
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
        logger.error(f"Groq chat error: {e}")
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
    # Always English — prevents French/other language responses
    return "en"