"""Create room use case"""
from uuid import uuid4
from datetime import datetime
from ....domain.entities.room import Room
from ....domain.repositories.room_repository import RoomRepository
from ....domain.repositories.user_repository import UserRepository
from ....domain.exceptions import UserNotFoundException


class CreateRoomUseCase:
    """Use case for creating a new call room"""

    def __init__(
        self,
        room_repository: RoomRepository,
        user_repository: UserRepository
    ):
        self.room_repository = room_repository
        self.user_repository = user_repository

    async def execute(self, creator_id: int) -> Room:
        """
        Create a new room

        Args:
            creator_id: ID of the user creating the room

        Returns:
            Created room entity

        Raises:
            UserNotFoundException: If creator doesn't exist
        """
        # Verify creator exists
        creator = await self.user_repository.get_by_id(creator_id)
        if not creator:
            raise UserNotFoundException(f"User with id {creator_id} not found")

        # Create room
        room = Room(
            id=uuid4(),
            creator_id=creator_id,
            created_at=datetime.utcnow(),
            is_active=True
        )

        created_room = await self.room_repository.create(room)

        # Add creator as first participant
        await self.room_repository.add_participant(created_room.id, creator_id)

        return created_room
