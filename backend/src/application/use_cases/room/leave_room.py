"""Leave room use case"""
from uuid import UUID
from ....domain.repositories.room_repository import RoomRepository
from ....domain.exceptions import (
    RoomNotFoundException,
    ParticipantNotInRoomException
)


class LeaveRoomUseCase:
    """Use case for leaving a room"""

    def __init__(self, room_repository: RoomRepository):
        self.room_repository = room_repository

    async def execute(self, room_id: UUID, user_id: int) -> None:
        """
        Leave a room

        If the user is the creator and last participant, close the room.

        Args:
            room_id: ID of the room to leave
            user_id: ID of the user leaving

        Raises:
            RoomNotFoundException: If room doesn't exist
            ParticipantNotInRoomException: If user is not in room
        """
        # Verify room exists
        room = await self.room_repository.get_by_id(room_id)
        if not room:
            raise RoomNotFoundException(f"Room with id {room_id} not found")

        # Remove participant
        await self.room_repository.remove_participant(room_id, user_id)

        # Check if room is empty
        participants = await self.room_repository.get_participants(room_id)
        if not participants:
            # Close room if empty
            await self.room_repository.close_room(room_id)
