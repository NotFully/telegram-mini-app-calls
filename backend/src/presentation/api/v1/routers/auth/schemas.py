"""Auth API schemas"""
from pydantic import BaseModel, Field
from typing import Optional


class TelegramAuthRequest(BaseModel):
    """Request schema for Telegram authentication"""
    telegram_id: int = Field(..., gt=0, description="Telegram user ID")
    username: Optional[str] = Field(None, max_length=255, description="Telegram username")
    first_name: str = Field(..., min_length=1, max_length=255, description="First name")
    last_name: Optional[str] = Field(None, max_length=255, description="Last name")
    photo_url: Optional[str] = Field(None, max_length=512, description="Profile photo URL")
    init_data: Optional[str] = Field(None, description="Telegram init data for verification")


class TelegramAuthResponse(BaseModel):
    """Response schema for Telegram authentication"""
    user_id: int
    telegram_id: int
    username: Optional[str]
    first_name: str
    display_name: str
    is_new_user: bool = Field(description="True if user was just created")
