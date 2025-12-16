"""Application configuration"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "Telegram Calls API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # TURN/STUN Configuration
    TURN_URLS: List[str] = ["turn:localhost:3478"]
    STUN_URLS: List[str] = ["stun:stun.l.google.com:19302"]
    TURN_USERNAME: str = "username"
    TURN_PASSWORD: str = "password"

    # Security
    SECRET_KEY: str
    TELEGRAM_BOT_TOKEN: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


# Global settings instance
settings = Settings()
