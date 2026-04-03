from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import json


class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_URL_SYNC: str
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "anthropic/claude-3.5-sonnet"
    OPENROUTER_FAST_MODEL: str = "anthropic/claude-3-haiku"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    SHOPIFY_STORE_DOMAIN: str = ""
    SHOPIFY_ACCESS_TOKEN: str = ""
    SHOPIFY_WEBHOOK_SECRET: str = ""
    N8N_WEBHOOK_BASE_URL: str = "http://localhost:5678/webhook"
    N8N_SLA_BREACH_WEBHOOK: str = "http://localhost:5678/webhook/sla-breach"
    N8N_STOCKOUT_WEBHOOK: str = "http://localhost:5678/webhook/stockout"
    N8N_ESCALATION_WEBHOOK: str = "http://localhost:5678/webhook/escalation"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()