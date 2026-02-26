from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class TransactionEventBase(BaseModel):
    """交易事件基础模型"""
    event_type: str
    amount: Decimal
    from_member_id: Optional[UUID] = None
    to_member_id: Optional[UUID] = None
    reference_id: Optional[UUID] = None
    description: Optional[str] = None


class TransactionEventCreate(TransactionEventBase):
    """交易事件创建模型"""
    family_id: UUID


class TransactionEvent(TransactionEventBase):
    """交易事件响应模型"""
    id: UUID
    family_id: UUID
    status: str
    created_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class MemberBalanceSnapshot(BaseModel):
    """余额快照响应模型"""
    member_id: UUID
    balance: Decimal
    updated_at: datetime
    
    class Config:
        from_attributes = True
