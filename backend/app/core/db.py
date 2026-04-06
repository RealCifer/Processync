from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from .config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,    # Validate connections before use
    pool_recycle=300,      # Recycle connections every 5 min
    pool_timeout=5,        # Give up acquiring a connection after 5s
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def check_db_connection() -> bool:
    """Non-blocking DB connectivity check. Returns False if DB is unavailable."""
    try:
        # Use a raw connection with short timeout to prevent hanging
        raw_conn = engine.raw_connection()
        cursor = raw_conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        raw_conn.close()
        return True
    except Exception as e:
        logger.warning(f"Database not reachable: {type(e).__name__}: {e}")
        return False

def get_db():
    db = SessionLocal()
    try:
        yield db
    except OperationalError as e:
        logger.error(f"DB session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
