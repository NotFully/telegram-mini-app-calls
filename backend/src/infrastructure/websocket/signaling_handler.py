"""WebRTC signaling handler"""
from typing import Dict, Any
from uuid import UUID
from .connection_manager import ConnectionManager
from ...core.logger import get_logger

logger = get_logger(__name__)


class SignalingHandler:
    """
    Handles WebRTC signaling messages between peers

    Supports:
        - join-room: User joins a call room
        - offer: WebRTC offer (SDP)
        - answer: WebRTC answer (SDP)
        - ice-candidate: ICE candidate exchange
        - leave-room: User leaves a call room
    """

    def __init__(self, manager: ConnectionManager):
        self.manager = manager

    async def handle_message(self, message: Dict[str, Any], user_id: int):
        """Route incoming WebSocket message to appropriate handler"""
        msg_type = message.get("type")

        if not msg_type:
            logger.warning(f"Received message without type from user {user_id}")
            return

        logger.info(f"Handling message type '{msg_type}' from user {user_id}")

        handlers = {
            "join-room": self._handle_join_room,
            "offer": self._handle_offer,
            "answer": self._handle_answer,
            "ice-candidate": self._handle_ice_candidate,
            "leave-room": self._handle_leave_room,
        }

        handler = handlers.get(msg_type)
        if handler:
            try:
                await handler(message, user_id)
            except Exception as e:
                logger.error(f"Error handling {msg_type} from user {user_id}: {e}")
                await self.manager.send_personal_message(
                    {"type": "error", "message": str(e)},
                    user_id
                )
        else:
            logger.warning(f"Unknown message type '{msg_type}' from user {user_id}")

    async def _handle_join_room(self, message: Dict, user_id: int):
        """Handle user joining a room"""
        room_id_str = message.get("room_id")
        if not room_id_str:
            logger.warning(f"Missing room_id in join-room from user {user_id}. Message: {message}")
            return

        try:
            room_id = UUID(room_id_str)
        except ValueError:
            logger.warning(f"Invalid room_id format from user {user_id}: {room_id_str}")
            return

        # Get existing participants before adding new user
        existing_participants = self.manager.get_room_participants(room_id)

        # Add user to room
        self.manager.add_to_room(room_id, user_id)

        # Notify existing participants about new user
        await self.manager.broadcast_to_room(
            {
                "type": "user-joined",
                "user_id": user_id,
                "room_id": str(room_id)
            },
            room_id,
            exclude_user=user_id
        )

        # Send list of existing participants to new user
        await self.manager.send_personal_message(
            {
                "type": "room-users",
                "room_id": str(room_id),
                "users": list(existing_participants)
            },
            user_id
        )

        logger.info(f"User {user_id} joined room {room_id}")

    async def _handle_offer(self, message: Dict, user_id: int):
        """Handle WebRTC offer"""
        target_user_id = message.get("target_user_id")
        sdp = message.get("sdp")
        room_id = message.get("room_id")

        if not target_user_id or not sdp:
            logger.warning(f"Missing target_user_id or sdp in offer from user {user_id}")
            return

        await self.manager.send_personal_message(
            {
                "type": "offer",
                "from_user_id": user_id,
                "room_id": room_id,
                "sdp": sdp
            },
            target_user_id
        )

        logger.info(f"Forwarded offer from user {user_id} to user {target_user_id}")

    async def _handle_answer(self, message: Dict, user_id: int):
        """Handle WebRTC answer"""
        target_user_id = message.get("target_user_id")
        sdp = message.get("sdp")

        if not target_user_id or not sdp:
            logger.warning(f"Missing target_user_id or sdp in answer from user {user_id}")
            return

        await self.manager.send_personal_message(
            {
                "type": "answer",
                "from_user_id": user_id,
                "sdp": sdp
            },
            target_user_id
        )

        logger.info(f"Forwarded answer from user {user_id} to user {target_user_id}")

    async def _handle_ice_candidate(self, message: Dict, user_id: int):
        """Handle ICE candidate"""
        target_user_id = message.get("target_user_id")
        candidate = message.get("candidate")

        if not target_user_id or not candidate:
            logger.warning(
                f"Missing target_user_id or candidate in ice-candidate from user {user_id}"
            )
            return

        await self.manager.send_personal_message(
            {
                "type": "ice-candidate",
                "from_user_id": user_id,
                "candidate": candidate
            },
            target_user_id
        )

        logger.debug(f"Forwarded ICE candidate from user {user_id} to user {target_user_id}")

    async def _handle_leave_room(self, message: Dict, user_id: int):
        """Handle user leaving a room"""
        room_id_str = message.get("room_id")
        if not room_id_str:
            logger.warning(f"Missing room_id in leave-room from user {user_id}")
            return

        try:
            room_id = UUID(room_id_str)
        except ValueError:
            logger.warning(f"Invalid room_id format from user {user_id}: {room_id_str}")
            return

        # Remove user from room
        self.manager.remove_from_room(room_id, user_id)

        # Notify other participants
        await self.manager.broadcast_to_room(
            {
                "type": "user-left",
                "user_id": user_id,
                "room_id": str(room_id)
            },
            room_id
        )

        logger.info(f"User {user_id} left room {room_id}")
