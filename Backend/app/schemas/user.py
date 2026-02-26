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
    # 前端需要的字段
    name: str = ""  # 显示名称
    message: str = "今天也要赚钱"  # 个性签名
    balance: int = 0  # 余额
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        # 自定义ORM转换，添加前端需要的字段
        user_dict = super().from_orm(obj).dict()
        user_dict['name'] = obj.nickname  # 使用昵称作为显示名称
        user_dict['message'] = "今天也要赚钱"  # 默认个性签名
        user_dict['balance'] = 0  # 默认余额
        return cls(**user_dict)
