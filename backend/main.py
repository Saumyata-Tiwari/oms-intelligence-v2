"""
OMS Intelligence v2 — FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.config import settings
from app.database import create_tables
from app.routers.chat import router as chat_router
from app.routers.orders import router as orders_router
from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router
from app.routers.webhooks import auth_router, webhook_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 OMS Intelligence v2 starting...")
    await create_tables()
    logger.info("✅ Database tables ready")
    yield
    logger.info("👋 OMS Intelligence v2 shutting down...")


app = FastAPI(
    title="OMS Intelligence v2",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(orders_router)
app.include_router(analytics_router)
app.include_router(webhook_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.APP_HOST, port=settings.APP_PORT, reload=True)