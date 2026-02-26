from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class LoginRequest(BaseModel):
    """登录请求模型"""
    code: str  # 微信登录code


class Token(BaseModel):
    """令牌响应模型"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """令牌数据模型"""
    user_id: Optional[UUID] = None
