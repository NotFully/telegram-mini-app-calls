"""Dependency injection for FastAPI"""
from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..infrastructure.database.base import get_db
from ..infrastructure.database.repositories.user_repository_impl import UserRepositoryImpl
from ..infrastructure.database.repositories.room_repository_impl import RoomRepositoryImpl
from ..application.use_cases.user.create_user import CreateUserUseCase
from ..application.use_cases.user.get_user import GetUserUseCase
from ..application.use_cases.user.list_online_users import ListOnlineUsersUseCase
from ..application.use_cases.room.create_room import CreateRoomUseCase
from ..application.use_cases.room.get_room_info import GetRoomInfoUseCase
from ..application.use_cases.room.list_active_rooms import ListActiveRoomsUseCase
from ..application.use_cases.room.join_room import JoinRoomUseCase
from ..application.use_cases.room.leave_room import LeaveRoomUseCase


# Database session dependency
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async for session in get_db():
        yield session


# User dependencies
async def get_user_repository(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[UserRepositoryImpl, None]:
    """Get user repository instance"""
    yield UserRepositoryImpl(session)


async def get_create_user_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[CreateUserUseCase, None]:
    """Get CreateUser use case instance"""
    user_repo = UserRepositoryImpl(session)
    yield CreateUserUseCase(user_repo)


async def get_get_user_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[GetUserUseCase, None]:
    """Get GetUser use case instance"""
    user_repo = UserRepositoryImpl(session)
    yield GetUserUseCase(user_repo)


async def get_list_online_users_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[ListOnlineUsersUseCase, None]:
    """Get ListOnlineUsers use case instance"""
    user_repo = UserRepositoryImpl(session)
    yield ListOnlineUsersUseCase(user_repo)


# Room dependencies
async def get_room_repository(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[RoomRepositoryImpl, None]:
    """Get room repository instance"""
    yield RoomRepositoryImpl(session)


async def get_create_room_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[CreateRoomUseCase, None]:
    """Get CreateRoom use case instance"""
    room_repo = RoomRepositoryImpl(session)
    user_repo = UserRepositoryImpl(session)
    yield CreateRoomUseCase(room_repo, user_repo)


async def get_get_room_info_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[GetRoomInfoUseCase, None]:
    """Get GetRoomInfo use case instance"""
    room_repo = RoomRepositoryImpl(session)
    yield GetRoomInfoUseCase(room_repo)


async def get_list_active_rooms_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[ListActiveRoomsUseCase, None]:
    """Get ListActiveRooms use case instance"""
    room_repo = RoomRepositoryImpl(session)
    yield ListActiveRoomsUseCase(room_repo)


async def get_join_room_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[JoinRoomUseCase, None]:
    """Get JoinRoom use case instance"""
    room_repo = RoomRepositoryImpl(session)
    user_repo = UserRepositoryImpl(session)
    yield JoinRoomUseCase(room_repo, user_repo)


async def get_leave_room_use_case(
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[LeaveRoomUseCase, None]:
    """Get LeaveRoom use case instance"""
    room_repo = RoomRepositoryImpl(session)
    user_repo = UserRepositoryImpl(session)
    yield LeaveRoomUseCase(room_repo, user_repo)
