from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """用户基础模型"""
    nickname: str
    avatar_key: Optional[str] = None


class UserCreate(UserBase):
    """用户创建模型"""
    pass


class UserUpdate(BaseModel):
    """用户更新模型"""
    nickname: Optional[str] = None
    avatar_key: Optional[str] = None


class User(UserBase):
    """用户响应模型"""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
