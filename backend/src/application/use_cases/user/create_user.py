"""Create user use case"""
from ....domain.entities.user import User
from ....domain.repositories.user_repository import UserRepository
from ....domain.exceptions import UserAlreadyExistsException
from ...dto.user_dto import CreateUserDTO


class CreateUserUseCase:
    """
    Use case for creating or retrieving a user

    If user with telegram_id already exists, returns existing user.
    Otherwise creates new user.
    """

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute(self, dto: CreateUserDTO) -> User:
        """
        Create or get existing user

        Args:
            dto: User creation data

        Returns:
            User entity

        Raises:
            ValueError: If user data is invalid
        """
        # Check if user already exists
        existing_user = await self.user_repository.get_by_telegram_id(dto.telegram_id)
        if existing_user:
            return existing_user

        # Create new user
        user = User(
            telegram_id=dto.telegram_id,
            username=dto.username,
            first_name=dto.first_name,
            last_name=dto.last_name,
            photo_url=dto.photo_url,
            is_online=False
        )

        created_user = await self.user_repository.create(user)
        return created_user
