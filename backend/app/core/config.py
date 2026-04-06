from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Processync AI"
    # Credentials match the running 'db' Docker container from docker-compose (user=user, port=5433)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5433/processync")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Storage settings
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()
