"""User database model"""
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, DateTime
from sqlalchemy.sql import func
from ..base import Base


class UserModel(Base):
    """User database model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=True)
    photo_url = Column(String(512), nullable=True)
    is_online = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, username={self.username})>"
