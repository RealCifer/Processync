import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5433/processync"
    REDIS_URL: str = "redis://localhost:6379/0"
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.getcwd(), "../uploads"))

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
