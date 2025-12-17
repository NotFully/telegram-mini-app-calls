"""API v1"""
from fastapi import APIRouter
from .routers import auth, user, room, config

# Create v1 router
api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(room.router)
api_router.include_router(config.router)

__all__ = ["api_router"]
