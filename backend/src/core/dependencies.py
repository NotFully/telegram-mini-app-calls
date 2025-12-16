"""Dependency injection for FastAPI"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from ..infrastructure.database import get_session, UserRepositoryImpl, RoomRepositoryImpl
from ..application.use_cases.user import (
    CreateUserUseCase,
    GetUserUseCase,
    ListOnlineUsersUseCase,
)
from ..application.use_cases.room import (
    CreateRoomUseCase,
    JoinRoomUseCase,
    LeaveRoomUseCase,
    GetRoomInfoUseCase,
    ListActiveRoomsUseCase,
)


# Database session dependency
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async for session in get_session():
        yield session


# User dependencies
async def get_user_repository(
    session: AsyncSession = None
) -> UserRepositoryImpl:
    """Get user repository instance"""
    if session is None:
        async for session in get_db_session():
            yield UserRepositoryImpl(session)
    else:
        return UserRepositoryImpl(session)


async def get_create_user_use_case(
    session: AsyncSession = None
) -> CreateUserUseCase:
    """Get CreateUser use case instance"""
    if session is None:
        async for session in get_db_session():
            user_repo = UserRepositoryImpl(session)
            yield CreateUserUseCase(user_repo)
    else:
        user_repo = UserRepositoryImpl(session)
        return CreateUserUseCase(user_repo)


async def get_get_user_use_case(
    session: AsyncSession = None
) -> GetUserUseCase:
    """Get GetUser use case instance"""
    if session is None:
        async for session in get_db_session():
            user_repo = UserRepositoryImpl(session)
            yield GetUserUseCase(user_repo)
    else:
        user_repo = UserRepositoryImpl(session)
        return GetUserUseCase(user_repo)


async def get_list_online_users_use_case(
    session: AsyncSession = None
) -> ListOnlineUsersUseCase:
    """Get ListOnlineUsers use case instance"""
    if session is None:
        async for session in get_db_session():
            user_repo = UserRepositoryImpl(session)
            yield ListOnlineUsersUseCase(user_repo)
    else:
        user_repo = UserRepositoryImpl(session)
        return ListOnlineUsersUseCase(user_repo)


# Room dependencies
async def get_room_repository(
    session: AsyncSession = None
) -> RoomRepositoryImpl:
    """Get room repository instance"""
    if session is None:
        async for session in get_db_session():
            yield RoomRepositoryImpl(session)
    else:
        return RoomRepositoryImpl(session)


async def get_create_room_use_case(
    session: AsyncSession = None
) -> CreateRoomUseCase:
    """Get CreateRoom use case instance"""
    if session is None:
        async for session in get_db_session():
            user_repo = UserRepositoryImpl(session)
            room_repo = RoomRepositoryImpl(session)
            yield CreateRoomUseCase(room_repo, user_repo)
    else:
        user_repo = UserRepositoryImpl(session)
        room_repo = RoomRepositoryImpl(session)
        return CreateRoomUseCase(room_repo, user_repo)


async def get_join_room_use_case(
    session: AsyncSession = None
) -> JoinRoomUseCase:
    """Get JoinRoom use case instance"""
    if session is None:
        async for session in get_db_session():
            user_repo = UserRepositoryImpl(session)
            room_repo = RoomRepositoryImpl(session)
            yield JoinRoomUseCase(room_repo, user_repo)
    else:
        user_repo = UserRepositoryImpl(session)
        room_repo = RoomRepositoryImpl(session)
        return JoinRoomUseCase(room_repo, user_repo)


async def get_leave_room_use_case(
    session: AsyncSession = None
) -> LeaveRoomUseCase:
    """Get LeaveRoom use case instance"""
    if session is None:
        async for session in get_db_session():
            room_repo = RoomRepositoryImpl(session)
            yield LeaveRoomUseCase(room_repo)
    else:
        room_repo = RoomRepositoryImpl(session)
        return LeaveRoomUseCase(room_repo)


async def get_get_room_info_use_case(
    session: AsyncSession = None
) -> GetRoomInfoUseCase:
    """Get GetRoomInfo use case instance"""
    if session is None:
        async for session in get_db_session():
            room_repo = RoomRepositoryImpl(session)
            yield GetRoomInfoUseCase(room_repo)
    else:
        room_repo = RoomRepositoryImpl(session)
        return GetRoomInfoUseCase(room_repo)


async def get_list_active_rooms_use_case(
    session: AsyncSession = None
) -> ListActiveRoomsUseCase:
    """Get ListActiveRooms use case instance"""
    if session is None:
        async for session in get_db_session():
            room_repo = RoomRepositoryImpl(session)
            yield ListActiveRoomsUseCase(room_repo)
    else:
        room_repo = RoomRepositoryImpl(session)
        return ListActiveRoomsUseCase(room_repo)
