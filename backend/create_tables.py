"""Run this once to create all DB tables."""
from app.core.config import settings
from app.core.db import engine, Base

# Import models so SQLAlchemy registers them
from app.models.document import Document
from app.models.job import Job
from app.models.result import Result
from sqlalchemy import text

print(f"Connecting to: {settings.DATABASE_URL}")

try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
        ))
        tables = [row[0] for row in result]
        print(f"✅ Tables in DB: {tables}")
except Exception as e:
    print(f"❌ Error: {e}")
