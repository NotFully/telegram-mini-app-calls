"""Room API schemas"""
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class CreateRoomRequest(BaseModel):
    """Request to create a new room"""
    creator_id: int = Field(..., gt=0, description="ID of user creating the room")


class RoomResponse(BaseModel):
    """Room response schema"""
    id: UUID
    creator_id: int
    is_active: bool
    created_at: datetime
    closed_at: Optional[datetime]
    participants: List[int]


class RoomListResponse(BaseModel):
    """List of rooms response"""
    rooms: List[RoomResponse]
    total: int


class JoinRoomRequest(BaseModel):
    """Request to join a room"""
    user_id: int = Field(..., gt=0, description="ID of user joining")


class LeaveRoomRequest(BaseModel):
    """Request to leave a room"""
    user_id: int = Field(..., gt=0, description="ID of user leaving")
