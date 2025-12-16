"""Room Data Transfer Objects"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class CreateRoomDTO(BaseModel):
    """DTO for creating a room"""
    creator_id: int = Field(..., gt=0, description="ID of the user creating the room")


class RoomDTO(BaseModel):
    """DTO for room data"""
    id: UUID
    creator_id: int
    is_active: bool
    created_at: datetime
    closed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class RoomParticipantDTO(BaseModel):
    """DTO for room participant"""
    room_id: UUID
    user_id: int
    joined_at: datetime
    left_at: Optional[datetime]

    model_config = {"from_attributes": True}


class RoomResponseDTO(BaseModel):
    """DTO for room response with participant count"""
    id: UUID
    creator_id: int
    is_active: bool
    created_at: datetime
    closed_at: Optional[datetime]
    participant_count: Optional[int] = None
    participants: Optional[List[int]] = None

    model_config = {"from_attributes": True}
