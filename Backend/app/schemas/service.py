from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ServiceBase(BaseModel):
    """服务基础模型"""
    title: str
    price: Decimal
    provider_id: UUID


class ServiceCreate(ServiceBase):
    """服务创建模型"""
    family_id: UUID


class ServiceUpdate(BaseModel):
    """服务更新模型"""
    title: Optional[str] = None
    price: Optional[Decimal] = None
    status: Optional[str] = None


class Service(ServiceBase):
    """服务响应模型"""
    id: UUID
    family_id: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
