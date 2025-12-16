"""List online users use case"""
from typing import List
from ....domain.entities.user import User
from ....domain.repositories.user_repository import UserRepository


class ListOnlineUsersUseCase:
    """Use case for listing all online users"""

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute(self) -> List[User]:
        """
        List all online users

        Returns:
            List of online users
        """
        return await self.user_repository.list_online()
