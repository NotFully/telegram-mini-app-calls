"""User repository interface"""
from abc import abstractmethod
from typing import Optional, List
from ..entities.user import User


class UserRepository:
    """User repository interface"""

    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user"""
        pass

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by internal ID"""
        pass

    @abstractmethod
    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID"""
        pass

    @abstractmethod
    async def list_online(self) -> List[User]:
        """List all online users"""
        pass

    @abstractmethod
    async def update_online_status(self, user_id: int, is_online: bool) -> None:
        """Update user's online status"""
        pass

    @abstractmethod
    async def exists_by_telegram_id(self, telegram_id: int) -> bool:
        """Check if user exists by Telegram ID"""
        pass
