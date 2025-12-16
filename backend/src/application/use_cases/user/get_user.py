"""Get user use case"""
from typing import Optional
from ....domain.entities.user import User
from ....domain.repositories.user_repository import UserRepository
from ....domain.exceptions import UserNotFoundException


class GetUserUseCase:
    """Use case for getting user by ID or Telegram ID"""

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute_by_id(self, user_id: int) -> User:
        """
        Get user by internal ID

        Args:
            user_id: Internal user ID

        Returns:
            User entity

        Raises:
            UserNotFoundException: If user not found
        """
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(f"User with id {user_id} not found")
        return user

    async def execute_by_telegram_id(self, telegram_id: int) -> User:
        """
        Get user by Telegram ID

        Args:
            telegram_id: Telegram user ID

        Returns:
            User entity

        Raises:
            UserNotFoundException: If user not found
        """
        user = await self.user_repository.get_by_telegram_id(telegram_id)
        if not user:
            raise UserNotFoundException(f"User with telegram_id {telegram_id} not found")
        return user
