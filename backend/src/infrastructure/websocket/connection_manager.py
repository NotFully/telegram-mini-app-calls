"""WebSocket connection manager"""
from typing import Dict, Set
from uuid import UUID
from fastapi import WebSocket
from ...core.logger import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for users and rooms

    Attributes:
        active_connections: Map of user_id -> WebSocket
        rooms: Map of room_id -> Set of user_ids
    """

    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}
        # room_id -> Set[user_id]
        self.rooms: Dict[UUID, Set[int]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, user_id: int):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")

            # Remove user from all rooms
            for room_id in list(self.rooms.keys()):
                if user_id in self.rooms[room_id]:
                    self.rooms[room_id].discard(user_id)
                    if not self.rooms[room_id]:
                        del self.rooms[room_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                logger.debug(f"Sent message to user {user_id}: {message.get('type')}")
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast_to_room(
        self,
        message: dict,
        room_id: UUID,
        exclude_user: int = None
    ):
        """Broadcast message to all users in room"""
        if room_id not in self.rooms:
            logger.warning(f"Attempted to broadcast to non-existent room {room_id}")
            return

        participants = self.rooms[room_id].copy()
        if exclude_user:
            participants.discard(exclude_user)

        logger.debug(
            f"Broadcasting to room {room_id}: {message.get('type')} "
            f"(to {len(participants)} users)"
        )

        for user_id in participants:
            await self.send_personal_message(message, user_id)

    def add_to_room(self, room_id: UUID, user_id: int):
        """Add user to room"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()

        self.rooms[room_id].add(user_id)
        logger.info(
            f"User {user_id} joined room {room_id}. "
            f"Room has {len(self.rooms[room_id])} participants"
        )

    def remove_from_room(self, room_id: UUID, user_id: int):
        """Remove user from room"""
        if room_id in self.rooms:
            self.rooms[room_id].discard(user_id)
            logger.info(f"User {user_id} left room {room_id}")

            # Clean up empty room
            if not self.rooms[room_id]:
                del self.rooms[room_id]
                logger.info(f"Room {room_id} is now empty and removed")

    def get_room_participants(self, room_id: UUID) -> Set[int]:
        """Get set of user IDs in room"""
        return self.rooms.get(room_id, set()).copy()

    def is_user_online(self, user_id: int) -> bool:
        """Check if user is connected"""
        return user_id in self.active_connections

    def get_online_users_count(self) -> int:
        """Get count of online users"""
        return len(self.active_connections)

    def get_active_rooms_count(self) -> int:
        """Get count of active rooms"""
        return len(self.rooms)
