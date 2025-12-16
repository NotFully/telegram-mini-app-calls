"""Database session management"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from .base import AsyncSessionLocal


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session

    Usage:
        @app.get("/")
        async def endpoint(db: AsyncSession = Depends(get_session)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
