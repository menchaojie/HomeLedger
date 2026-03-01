from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class MessageBase(BaseModel):
    """消息基础模型"""
    title: str
    content: str
    type: str


class MessageCreate(MessageBase):
    """消息创建模型"""
    user_id: UUID


class MessageUpdate(BaseModel):
    """消息更新模型"""
    read: bool


class Message(MessageBase):
    """消息响应模型"""
    id: UUID
    user_id: UUID
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True