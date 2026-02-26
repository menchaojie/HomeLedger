from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class RewardBase(BaseModel):
    """奖励基础模型"""
    amount: Decimal
    reason: Optional[str] = None


class RewardCreate(RewardBase):
    """奖励创建模型"""
    family_id: UUID
    member_id: UUID


class RewardUpdate(BaseModel):
    """奖励更新模型"""
    status: str


class Reward(RewardBase):
    """奖励响应模型"""
    id: UUID
    family_id: UUID
    member_id: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
