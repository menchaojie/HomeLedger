from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class BountyTaskBase(BaseModel):
    """悬赏任务基础模型"""
    title: str
    reward_amount: Decimal
    assigned_to: Optional[UUID] = None


class BountyTaskCreate(BountyTaskBase):
    """悬赏任务创建模型"""
    family_id: UUID
    created_by: UUID


class BountyTaskUpdate(BaseModel):
    """悬赏任务更新模型"""
    title: Optional[str] = None
    reward_amount: Optional[Decimal] = None
    assigned_to: Optional[UUID] = None
    status: Optional[str] = None


class BountyTask(BountyTaskBase):
    """悬赏任务响应模型"""
    id: UUID
    family_id: UUID
    created_by: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
