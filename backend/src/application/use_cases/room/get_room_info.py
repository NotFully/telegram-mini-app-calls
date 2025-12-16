"""Get room info use case"""
from uuid import UUID
from typing import List
from ....domain.entities.room import Room
from ....domain.repositories.room_repository import RoomRepository
from ....domain.exceptions import RoomNotFoundException


class GetRoomInfoUseCase:
    """Use case for getting room information"""

    def __init__(self, room_repository: RoomRepository):
        self.room_repository = room_repository

    async def execute(self, room_id: UUID) -> tuple[Room, List[int]]:
        """
        Get room information with participants

        Args:
            room_id: ID of the room

        Returns:
            Tuple of (Room entity, list of participant user IDs)

        Raises:
            RoomNotFoundException: If room doesn't exist
        """
        room = await self.room_repository.get_by_id(room_id)
        if not room:
            raise RoomNotFoundException(f"Room with id {room_id} not found")

        participants = await self.room_repository.get_participants(room_id)

        return room, participants
