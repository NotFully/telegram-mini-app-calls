"""WebSocket router for signaling"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...infrastructure.websocket import ConnectionManager, SignalingHandler
from ...core.logger import get_logger
from ...core.dependencies import get_db_session
from ...infrastructure.database.repositories import UserRepositoryImpl

logger = get_logger(__name__)

router = APIRouter(tags=["WebSocket"])

# Global connection manager and signaling handler
manager = ConnectionManager()
signaling = SignalingHandler(manager)


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int = Query(..., gt=0, description="User ID for this connection"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    WebSocket endpoint for WebRTC signaling

    Handles:
    - join-room: Join a call room
    - offer: WebRTC offer (SDP)
    - answer: WebRTC answer (SDP)
    - ice-candidate: ICE candidate exchange
    - leave-room: Leave a call room
    """
    # Update user status to online in database
    user_repo = UserRepositoryImpl(db)
    try:
        await user_repo.update_online_status(user_id, True)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to set user {user_id} online: {e}")

    await manager.connect(websocket, user_id)

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "message": "WebSocket connected successfully"
        })

        # Message handling loop
        while True:
            data = await websocket.receive_json()
            await signaling.handle_message(data, user_id)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user_id={user_id}")
        manager.disconnect(user_id)
        # Update user status to offline
        try:
            await user_repo.update_online_status(user_id, False)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to set user {user_id} offline: {e}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)
        # Update user status to offline
        try:
            await user_repo.update_online_status(user_id, False)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to set user {user_id} offline: {e}")
        raise


@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return {
        "online_users": manager.get_online_users_count(),
        "active_rooms": manager.get_active_rooms_count()
    }
