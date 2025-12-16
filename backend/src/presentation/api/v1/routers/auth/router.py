"""Auth API router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import TelegramAuthRequest, TelegramAuthResponse
from ......core.dependencies import get_db_session, get_create_user_use_case
from ......application.use_cases.user import CreateUserUseCase
from ......application.dto.user_dto import CreateUserDTO
from ......core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/telegram", response_model=TelegramAuthResponse, status_code=status.HTTP_200_OK)
async def telegram_auth(
    request: TelegramAuthRequest,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Authenticate user via Telegram Mini App

    Creates a new user if doesn't exist, otherwise returns existing user.
    """
    try:
        # TODO: Verify init_data signature
        # if request.init_data:
        #     if not verify_telegram_init_data(request.init_data):
        #         raise HTTPException(status_code=401, detail="Invalid Telegram init data")

        # Create or get user
        use_case = await get_create_user_use_case(session)
        dto = CreateUserDTO(
            telegram_id=request.telegram_id,
            username=request.username,
            first_name=request.first_name,
            last_name=request.last_name,
            photo_url=request.photo_url
        )

        # Check if user already existed
        from ......infrastructure.database.repositories import UserRepositoryImpl
        user_repo = UserRepositoryImpl(session)
        existing_user = await user_repo.get_by_telegram_id(request.telegram_id)
        is_new_user = existing_user is None

        user = await use_case.execute(dto)

        logger.info(
            f"User {'created' if is_new_user else 'authenticated'}: "
            f"telegram_id={user.telegram_id}, user_id={user.id}"
        )

        return TelegramAuthResponse(
            user_id=user.id,
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            display_name=user.display_name,
            is_new_user=is_new_user
        )

    except ValueError as e:
        logger.warning(f"Invalid auth request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )
