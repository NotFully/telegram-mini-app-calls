"""Join room use case"""
from uuid import UUID
from ....domain.repositories.room_repository import RoomRepository
from ....domain.repositories.user_repository import UserRepository
from ....domain.exceptions import (
    RoomNotFoundException,
    UserNotFoundException,
    RoomAlreadyClosedException,
    ParticipantAlreadyInRoomException
)


class JoinRoomUseCase:
    """Use case for joining a room"""

    def __init__(
        self,
        room_repository: RoomRepository,
        user_repository: UserRepository
    ):
        self.room_repository = room_repository
        self.user_repository = user_repository

    async def execute(self, room_id: UUID, user_id: int) -> None:
        """
        Join a room

        Args:
            room_id: ID of the room to join
            user_id: ID of the user joining

        Raises:
            RoomNotFoundException: If room doesn't exist
            UserNotFoundException: If user doesn't exist
            RoomAlreadyClosedException: If room is closed
            ParticipantAlreadyInRoomException: If user is already in room
        """
        # Verify room exists and is active
        room = await self.room_repository.get_by_id(room_id)
        if not room:
            raise RoomNotFoundException(f"Room with id {room_id} not found")

        if not room.is_active:
            raise RoomAlreadyClosedException(f"Room {room_id} is closed")

        # Verify user exists
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundException(f"User with id {user_id} not found")

        # Add participant to room
        await self.room_repository.add_participant(room_id, user_id)
