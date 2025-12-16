"""Room API router"""
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from .schemas import (
    CreateRoomRequest,
    RoomResponse,
    RoomListResponse,
    JoinRoomRequest,
    LeaveRoomRequest
)
from ......core.dependencies import (
    get_db_session,
    get_create_room_use_case,
    get_join_room_use_case,
    get_leave_room_use_case,
    get_get_room_info_use_case,
    get_list_active_rooms_use_case
)
from ......application.use_cases.room import (
    CreateRoomUseCase,
    JoinRoomUseCase,
    LeaveRoomUseCase,
    GetRoomInfoUseCase,
    ListActiveRoomsUseCase
)
from ......domain.exceptions import (
    RoomNotFoundException,
    UserNotFoundException,
    RoomAlreadyClosedException,
    ParticipantAlreadyInRoomException
)
from ......core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    request: CreateRoomRequest,
    use_case: CreateRoomUseCase = Depends(get_create_room_use_case),
    session: AsyncSession = Depends(get_db_session)
):
    """Create a new room"""
    try:
        room = await use_case.execute(request.creator_id)

        # Get participants
        from ......infrastructure.database.repositories import RoomRepositoryImpl
        room_repo = RoomRepositoryImpl(session)
        participants = await room_repo.get_participants(room.id)

        logger.info(f"Room created: {room.id} by user {request.creator_id}")

        return RoomResponse(
            id=room.id,
            creator_id=room.creator_id,
            is_active=room.is_active,
            created_at=room.created_at,
            closed_at=room.closed_at,
            participants=participants
        )
    except UserNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create room"
        )


@router.get("", response_model=RoomListResponse)
async def list_active_rooms(
    use_case: ListActiveRoomsUseCase = Depends(get_list_active_rooms_use_case),
    session: AsyncSession = Depends(get_db_session)
):
    """List all active rooms"""
    try:
        rooms = await use_case.execute()

        # Get participants for each room
        from ......infrastructure.database.repositories import RoomRepositoryImpl
        room_repo = RoomRepositoryImpl(session)

        room_responses = []
        for room in rooms:
            participants = await room_repo.get_participants(room.id)
            room_responses.append(
                RoomResponse(
                    id=room.id,
                    creator_id=room.creator_id,
                    is_active=room.is_active,
                    created_at=room.created_at,
                    closed_at=room.closed_at,
                    participants=participants
                )
            )

        return RoomListResponse(rooms=room_responses, total=len(room_responses))
    except Exception as e:
        logger.error(f"Error listing rooms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list rooms"
        )


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: UUID,
    use_case: GetRoomInfoUseCase = Depends(get_get_room_info_use_case)
):
    """Get room by ID"""
    try:
        room, participants = await use_case.execute(room_id)

        return RoomResponse(
            id=room.id,
            creator_id=room.creator_id,
            is_active=room.is_active,
            created_at=room.created_at,
            closed_at=room.closed_at,
            participants=participants
        )
    except RoomNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room {room_id} not found"
        )
    except Exception as e:
        logger.error(f"Error getting room {room_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get room"
        )


@router.post("/{room_id}/join", status_code=status.HTTP_200_OK)
async def join_room(
    room_id: UUID,
    request: JoinRoomRequest,
    use_case: JoinRoomUseCase = Depends(get_join_room_use_case)
):
    """Join a room"""
    try:
        await use_case.execute(room_id, request.user_id)

        logger.info(f"User {request.user_id} joined room {room_id}")
        return {"message": "Successfully joined room"}
    except (RoomNotFoundException, UserNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RoomAlreadyClosedException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ParticipantAlreadyInRoomException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        logger.error(f"Error joining room {room_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join room"
        )


@router.post("/{room_id}/leave", status_code=status.HTTP_200_OK)
async def leave_room(
    room_id: UUID,
    request: LeaveRoomRequest,
    use_case: LeaveRoomUseCase = Depends(get_leave_room_use_case)
):
    """Leave a room"""
    try:
        await use_case.execute(room_id, request.user_id)

        logger.info(f"User {request.user_id} left room {room_id}")
        return {"message": "Successfully left room"}
    except RoomNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error leaving room {room_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to leave room"
        )
