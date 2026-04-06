from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.routes import router as api_router
from .core.db import check_db_connection
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    # --- Startup (non-blocking) ---
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("🚀 Processync API starting...")

    # Run DB check in a thread so it never blocks the async event loop
    loop = asyncio.get_event_loop()
    try:
        db_ok = await asyncio.wait_for(
            loop.run_in_executor(None, check_db_connection),
            timeout=6.0
        )
        if db_ok:
            logger.info("✅ Database connected successfully")
        else:
            logger.warning("⚠️  Database NOT reachable — API starts anyway, uploads will fail gracefully")
    except asyncio.TimeoutError:
        logger.warning("⚠️  Database check timed out — API starts anyway")

    # Redis check
    try:
        import redis as redis_lib
        r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        await asyncio.wait_for(loop.run_in_executor(None, r.ping), timeout=3.0)
        logger.info("✅ Redis connected successfully")
    except Exception:
        logger.warning("⚠️  Redis NOT reachable — Celery tasks will not process until Redis is running")

    yield
    # --- Shutdown ---
    logger.info("🛑 Shutting down Processync API")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Processync AI API"}

@app.get("/health")
async def health():
    db_ok = check_db_connection()
    return {
        "status": "ok",
        "database": "connected" if db_ok else "unavailable",
    }
