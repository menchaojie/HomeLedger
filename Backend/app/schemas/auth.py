from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class LoginRequest(BaseModel):
    """登录请求模型"""
    code: Optional[str] = None  # 微信登录code
    username: Optional[str] = None  # 用户名登录
    password: Optional[str] = None  # 密码登录


class RegisterRequest(BaseModel):
    """注册请求模型"""
    username: str  # 用户名
    password: str  # 密码
    phone: Optional[str] = None  # 手机号
    email: Optional[str] = None  # 邮箱
    role: Optional[str] = None  # 家庭角色


class Token(BaseModel):
    """令牌响应模型"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """令牌数据模型"""
    user_id: Optional[UUID] = None
