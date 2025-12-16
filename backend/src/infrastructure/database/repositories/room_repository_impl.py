"""Room repository implementation"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError

from ....domain.entities.room import Room
from ....domain.repositories.room_repository import RoomRepository
from ....domain.exceptions import (
    RoomNotFoundException,
    ParticipantAlreadyInRoomException,
    ParticipantNotInRoomException
)
from ..models.room import RoomModel, RoomParticipantModel


class RoomRepositoryImpl(RoomRepository):
    """Room repository implementation using SQLAlchemy"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, room: Room) -> Room:
        """Create a new room"""
        db_room = RoomModel(
            id=room.id,
            creator_id=room.creator_id,
            is_active=room.is_active,
            created_at=room.created_at,
            closed_at=room.closed_at
        )
        self.session.add(db_room)
        await self.session.flush()
        await self.session.refresh(db_room)

        return self._to_entity(db_room)

    async def get_by_id(self, room_id: UUID) -> Optional[Room]:
        """Get room by ID"""
        result = await self.session.execute(
            select(RoomModel).where(RoomModel.id == room_id)
        )
        db_room = result.scalar_one_or_none()
        return self._to_entity(db_room) if db_room else None

    async def list_active(self) -> List[Room]:
        """List all active rooms"""
        result = await self.session.execute(
            select(RoomModel).where(RoomModel.is_active == True)
        )
        db_rooms = result.scalars().all()
        return [self._to_entity(db_room) for db_room in db_rooms]

    async def close_room(self, room_id: UUID) -> None:
        """Close a room"""
        result = await self.session.execute(
            select(RoomModel).where(RoomModel.id == room_id)
        )
        db_room = result.scalar_one_or_none()

        if not db_room:
            raise RoomNotFoundException(f"Room with id {room_id} not found")

        db_room.is_active = False
        db_room.closed_at = datetime.utcnow()
        await self.session.flush()

    async def add_participant(self, room_id: UUID, user_id: int) -> None:
        """Add participant to room"""
        # Check if participant already in room
        if await self.is_participant(room_id, user_id):
            raise ParticipantAlreadyInRoomException(
                f"User {user_id} is already in room {room_id}"
            )

        participant = RoomParticipantModel(
            room_id=room_id,
            user_id=user_id
        )
        self.session.add(participant)
        await self.session.flush()

    async def remove_participant(self, room_id: UUID, user_id: int) -> None:
        """Remove participant from room"""
        result = await self.session.execute(
            select(RoomParticipantModel).where(
                and_(
                    RoomParticipantModel.room_id == room_id,
                    RoomParticipantModel.user_id == user_id,
                    RoomParticipantModel.left_at.is_(None)
                )
            )
        )
        participant = result.scalar_one_or_none()

        if not participant:
            raise ParticipantNotInRoomException(
                f"User {user_id} is not in room {room_id}"
            )

        participant.left_at = datetime.utcnow()
        await self.session.flush()

    async def get_participants(self, room_id: UUID) -> List[int]:
        """Get list of participant IDs in room"""
        result = await self.session.execute(
            select(RoomParticipantModel.user_id).where(
                and_(
                    RoomParticipantModel.room_id == room_id,
                    RoomParticipantModel.left_at.is_(None)
                )
            )
        )
        return list(result.scalars().all())

    async def is_participant(self, room_id: UUID, user_id: int) -> bool:
        """Check if user is participant in room"""
        result = await self.session.execute(
            select(RoomParticipantModel).where(
                and_(
                    RoomParticipantModel.room_id == room_id,
                    RoomParticipantModel.user_id == user_id,
                    RoomParticipantModel.left_at.is_(None)
                )
            )
        )
        return result.scalar_one_or_none() is not None

    def _to_entity(self, model: RoomModel) -> Room:
        """Convert database model to domain entity"""
        return Room(
            id=model.id,
            creator_id=model.creator_id,
            created_at=model.created_at,
            closed_at=model.closed_at,
            is_active=model.is_active
        )
