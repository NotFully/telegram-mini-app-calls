"""User Data Transfer Objects"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CreateUserDTO(BaseModel):
    """DTO for creating a user"""
    telegram_id: int = Field(..., gt=0, description="Telegram user ID")
    username: Optional[str] = Field(None, max_length=255, description="Telegram username")
    first_name: str = Field(..., min_length=1, max_length=255, description="First name")
    last_name: Optional[str] = Field(None, max_length=255, description="Last name")
    photo_url: Optional[str] = Field(None, max_length=512, description="Profile photo URL")


class UserDTO(BaseModel):
    """DTO for user data"""
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    photo_url: Optional[str]
    is_online: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserResponseDTO(BaseModel):
    """DTO for user response"""
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    photo_url: Optional[str]
    is_online: bool
    display_name: str

    model_config = {"from_attributes": True}
