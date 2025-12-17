"""Config schemas"""
from typing import List, Optional
from pydantic import BaseModel


class ICEServer(BaseModel):
    """ICE server configuration"""
    urls: str
    username: Optional[str] = None
    credential: Optional[str] = None


class ConfigResponse(BaseModel):
    """Configuration response"""
    ice_servers: List[ICEServer]
