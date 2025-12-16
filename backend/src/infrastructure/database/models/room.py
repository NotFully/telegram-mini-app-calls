"""Room database models"""
from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid as uuid_lib
from ..base import Base


class RoomModel(Base):
    """Room database model"""
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_lib.uuid4)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    participants = relationship(
        "RoomParticipantModel",
        back_populates="room",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Room(id={self.id}, creator_id={self.creator_id}, is_active={self.is_active})>"


class RoomParticipantModel(Base):
    """Room participant database model (many-to-many relationship)"""
    __tablename__ = "room_participants"

    room_id = Column(
        UUID(as_uuid=True),
        ForeignKey("rooms.id", ondelete="CASCADE"),
        primary_key=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    left_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    room = relationship("RoomModel", back_populates="participants")

    def __repr__(self) -> str:
        return f"<RoomParticipant(room_id={self.room_id}, user_id={self.user_id})>"
