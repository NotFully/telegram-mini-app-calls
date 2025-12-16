"""User domain entity"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class User:
    """User domain entity representing a Telegram user"""
    telegram_id: int
    first_name: str
    username: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    is_online: bool = False

    def __post_init__(self):
        """Validate user data"""
        if self.telegram_id <= 0:
            raise ValueError("telegram_id must be positive")
        if not self.first_name or not self.first_name.strip():
            raise ValueError("first_name cannot be empty")

    @property
    def full_name(self) -> str:
        """Get user's full name"""
        if self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name

    @property
    def display_name(self) -> str:
        """Get user's display name (username or full name)"""
        return f"@{self.username}" if self.username else self.full_name
