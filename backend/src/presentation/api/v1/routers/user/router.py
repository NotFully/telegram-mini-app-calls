"""User API router"""
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import UserResponse, UserListResponse
from ......core.dependencies import (
    get_db_session,
    get_get_user_use_case,
    get_list_online_users_use_case
)
from ......application.use_cases.user import GetUserUseCase, ListOnlineUsersUseCase
from ......domain.exceptions import UserNotFoundException
from ......core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/online", response_model=UserListResponse)
async def list_online_users(
    use_case: ListOnlineUsersUseCase = Depends(get_list_online_users_use_case)
):
    """Get list of all online users"""
    try:
        users = await use_case.execute()

        return UserListResponse(
            users=[
                UserResponse(
                    id=u.id,
                    telegram_id=u.telegram_id,
                    username=u.username,
                    first_name=u.first_name,
                    last_name=u.last_name,
                    photo_url=u.photo_url,
                    is_online=u.is_online,
                    display_name=u.display_name
                )
                for u in users
            ],
            total=len(users)
        )
    except Exception as e:
        logger.error(f"Error listing online users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list online users"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int = Path(..., gt=0),
    use_case: GetUserUseCase = Depends(get_get_user_use_case)
):
    """Get user by ID"""
    try:
        user = await use_case.execute_by_id(user_id)

        return UserResponse(
            id=user.id,
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            photo_url=user.photo_url,
            is_online=user.is_online,
            display_name=user.display_name
        )
    except UserNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )
