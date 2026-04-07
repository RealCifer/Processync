from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Processync AI"
    # Credentials match the running 'db' Docker container from docker-compose (user=user, port=5433)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5433/processync")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Storage settings - Absolute path outside 'backend' to prevent auto-reload on every upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.abspath(os.path.join(os.getcwd(), "../uploads")))
    
    # Missing fields from .env (to avoid ValidationError)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "processync"
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
