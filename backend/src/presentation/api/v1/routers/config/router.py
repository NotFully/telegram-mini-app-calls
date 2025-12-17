"""Config router - returns application configuration"""
from fastapi import APIRouter
from .schemas import ConfigResponse
from ......core.config import settings

router = APIRouter(prefix="/config", tags=["config"])


@router.get("", response_model=ConfigResponse)
async def get_config() -> ConfigResponse:
    """
    Get application configuration including ICE servers

    Returns TURN/STUN server configuration for WebRTC
    """
    ice_servers = []

    # Add STUN servers
    for stun_url in settings.STUN_URLS:
        ice_servers.append({"urls": stun_url})

    # Add TURN servers with credentials
    for turn_url in settings.TURN_URLS:
        ice_servers.append({
            "urls": turn_url,
            "username": settings.TURN_USERNAME,
            "credential": settings.TURN_PASSWORD
        })

    return ConfigResponse(ice_servers=ice_servers)
