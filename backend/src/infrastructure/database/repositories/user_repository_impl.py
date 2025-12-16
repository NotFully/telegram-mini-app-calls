"""User repository implementation"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ....domain.entities.user import User
from ....domain.repositories.user_repository import UserRepository
from ....domain.exceptions import UserAlreadyExistsException, UserNotFoundException
from ..models.user import UserModel


class UserRepositoryImpl(UserRepository):
    """User repository implementation using SQLAlchemy"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user: User) -> User:
        """Create a new user"""
        try:
            db_user = UserModel(
                telegram_id=user.telegram_id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                photo_url=user.photo_url,
                is_online=user.is_online
            )
            self.session.add(db_user)
            await self.session.flush()
            await self.session.refresh(db_user)

            return self._to_entity(db_user)
        except IntegrityError:
            raise UserAlreadyExistsException(
                f"User with telegram_id {user.telegram_id} already exists"
            )

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by internal ID"""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        db_user = result.scalar_one_or_none()
        return self._to_entity(db_user) if db_user else None

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID"""
        result = await self.session.execute(
            select(UserModel).where(UserModel.telegram_id == telegram_id)
        )
        db_user = result.scalar_one_or_none()
        return self._to_entity(db_user) if db_user else None

    async def list_online(self) -> List[User]:
        """List all online users"""
        result = await self.session.execute(
            select(UserModel).where(UserModel.is_online == True)
        )
        db_users = result.scalars().all()
        return [self._to_entity(db_user) for db_user in db_users]

    async def update_online_status(self, user_id: int, is_online: bool) -> None:
        """Update user's online status"""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        db_user = result.scalar_one_or_none()

        if not db_user:
            raise UserNotFoundException(f"User with id {user_id} not found")

        db_user.is_online = is_online
        await self.session.flush()

    async def exists_by_telegram_id(self, telegram_id: int) -> bool:
        """Check if user exists by Telegram ID"""
        result = await self.session.execute(
            select(UserModel.id).where(UserModel.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none() is not None

    def _to_entity(self, model: UserModel) -> User:
        """Convert database model to domain entity"""
        return User(
            id=model.id,
            telegram_id=model.telegram_id,
            username=model.username,
            first_name=model.first_name,
            last_name=model.last_name,
            photo_url=model.photo_url,
            is_online=model.is_online,
            created_at=model.created_at
        )
