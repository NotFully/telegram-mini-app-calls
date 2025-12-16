"""User API schemas"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    photo_url: Optional[str]
    is_online: bool
    display_name: str


class UserListResponse(BaseModel):
    """List of users response"""
    users: List[UserResponse]
    total: int
