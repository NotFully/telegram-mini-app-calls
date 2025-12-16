"""List active rooms use case"""
from typing import List
from ....domain.entities.room import Room
from ....domain.repositories.room_repository import RoomRepository


class ListActiveRoomsUseCase:
    """Use case for listing all active rooms"""

    def __init__(self, room_repository: RoomRepository):
        self.room_repository = room_repository

    async def execute(self) -> List[Room]:
        """
        List all active rooms

        Returns:
            List of active room entities
        """
        return await self.room_repository.list_active()
