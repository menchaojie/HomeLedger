from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class FamilyBase(BaseModel):
    """家庭基础模型"""
    name: str
    avatar_key: Optional[str] = None


class FamilyCreate(FamilyBase):
    """家庭创建模型"""
    pass


class FamilyUpdate(BaseModel):
    """家庭更新模型"""
    name: Optional[str] = None
    avatar_key: Optional[str] = None


class Family(FamilyBase):
    """家庭响应模型"""
    id: UUID
    created_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class FamilyMemberBase(BaseModel):
    """家庭成员基础模型"""
    role: str
    monthly_quota: Decimal = Decimal(0)


class FamilyMemberCreate(FamilyMemberBase):
    """家庭成员创建模型"""
    user_id: UUID


class FamilyMemberUpdate(BaseModel):
    """家庭成员更新模型"""
    role: Optional[str] = None
    monthly_quota: Optional[Decimal] = None


class FamilyMember(FamilyMemberBase):
    """家庭成员响应模型"""
    id: UUID
    family_id: UUID
    user_id: UUID
    joined_at: datetime
    
    class Config:
        from_attributes = True
