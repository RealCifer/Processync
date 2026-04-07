from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .api import routes, websockets
from .core.db import engine, Base
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n[STARTUP] Processync API is initializing...")
    logger.info("Starting application lifespan...")
    
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[STARTUP] Database connection verified.")
        
        # Initialize tables
        Base.metadata.create_all(bind=engine)
        print("[STARTUP] Database tables verified/created.")
    except Exception as e:
        print(f"[STARTUP] WARNING: Database connection failed: {str(e)}")
        logger.warning(f"Database connection failed at startup: {e}")

    try:
        import redis
        from .core.config import settings
        r = redis.from_url(settings.REDIS_URL, socket_timeout=2)
        r.ping()
        print("[STARTUP] Redis connection verified.")
    except Exception as e:
        print(f"[STARTUP] WARNING: Redis connection failed: {str(e)}")
        logger.warning(f"Redis connection failed at startup: {e}")

    yield
    print("[SHUTDOWN] Processync API is shutting down...")

app = FastAPI(title="Processync API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
app.include_router(websockets.router)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "Processync API is operational", "version": "1.0.0"}
