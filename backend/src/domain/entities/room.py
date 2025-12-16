"""Room domain entity"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Room:
    """Room domain entity representing a call room"""
    id: UUID
    creator_id: int
    created_at: datetime
    closed_at: Optional[datetime] = None
    is_active: bool = True

    def __post_init__(self):
        """Validate room data"""
        if self.creator_id <= 0:
            raise ValueError("creator_id must be positive")
        if self.closed_at and self.closed_at < self.created_at:
            raise ValueError("closed_at cannot be before created_at")

    @property
    def duration(self) -> Optional[int]:
        """Get room duration in seconds"""
        if self.closed_at:
            return int((self.closed_at - self.created_at).total_seconds())
        return None

    def close(self) -> None:
        """Close the room"""
        if not self.is_active:
            raise ValueError("Room is already closed")
        self.closed_at = datetime.utcnow()
        self.is_active = False
