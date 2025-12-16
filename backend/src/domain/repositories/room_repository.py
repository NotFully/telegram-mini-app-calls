"""Room repository interface"""
from abc import abstractmethod
from typing import Optional, List
from uuid import UUID
from ..entities.room import Room


class RoomRepository:
    """Room repository interface"""

    @abstractmethod
    async def create(self, room: Room) -> Room:
        """Create a new room"""
        pass

    @abstractmethod
    async def get_by_id(self, room_id: UUID) -> Optional[Room]:
        """Get room by ID"""
        pass

    @abstractmethod
    async def list_active(self) -> List[Room]:
        """List all active rooms"""
        pass

    @abstractmethod
    async def close_room(self, room_id: UUID) -> None:
        """Close a room"""
        pass

    @abstractmethod
    async def add_participant(self, room_id: UUID, user_id: int) -> None:
        """Add participant to room"""
        pass

    @abstractmethod
    async def remove_participant(self, room_id: UUID, user_id: int) -> None:
        """Remove participant from room"""
        pass

    @abstractmethod
    async def get_participants(self, room_id: UUID) -> List[int]:
        """Get list of participant IDs in room"""
        pass

    @abstractmethod
    async def is_participant(self, room_id: UUID, user_id: int) -> bool:
        """Check if user is participant in room"""
        pass
