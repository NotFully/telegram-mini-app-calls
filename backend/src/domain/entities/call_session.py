"""Call session domain entity"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class CallSession:
    """Call session domain entity representing a call between users"""
    room_id: UUID
    caller_id: int
    callee_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    id: Optional[int] = None

    def __post_init__(self):
        """Validate call session data"""
        if self.caller_id <= 0:
            raise ValueError("caller_id must be positive")
        if self.callee_id <= 0:
            raise ValueError("callee_id must be positive")
        if self.caller_id == self.callee_id:
            raise ValueError("caller and callee cannot be the same user")
        if self.ended_at and self.ended_at < self.started_at:
            raise ValueError("ended_at cannot be before started_at")

    @property
    def is_active(self) -> bool:
        """Check if call is currently active"""
        return self.ended_at is None

    def end(self) -> None:
        """End the call session"""
        if not self.is_active:
            raise ValueError("Call session has already ended")
        self.ended_at = datetime.utcnow()
        self.duration_seconds = int((self.ended_at - self.started_at).total_seconds())
