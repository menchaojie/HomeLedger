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
    user_name: Optional[str] = None
    message: Optional[str] = None
    avatar_key: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class User(UserBase):
    """用户响应模型"""
    id: UUID
    created_at: datetime
    # 前端需要的字段
    name: str = ""  # 显示名称
    user_name: Optional[str] = None  # 用户名
    message: Optional[str] = "今天也要赚钱"  # 个性签名
    balance: int = 0  # 余额
    avatar: Optional[str] = None  # 头像URL
    phone: Optional[str] = None  # 手机号
    email: Optional[str] = None  # 邮箱
    role: Optional[str] = None  # 角色
    
    class Config:
        from_attributes = False
        
    @classmethod
    def from_orm(cls, obj):
        # 直接从ORM对象创建字典
        user_dict = {
            'id': obj.id,
            'nickname': obj.nickname,
            'avatar_key': obj.avatar_key,
            'created_at': obj.created_at,
            'name': obj.nickname,  # 使用昵称作为显示名称
            'user_name': obj.user_name,  # 用户名
            'message': obj.message if obj.message else "今天也要赚钱",  # 使用数据库中的个性签名，否则使用默认值
            'balance': 0,  # 默认余额
            'avatar': f"http://127.0.0.1:8000/static/avatars/{obj.avatar_key}" if obj.avatar_key else None,  # 处理头像字段
            'phone': obj.phone,
            'email': obj.email,
            'role': obj.role
        }
        return cls(**user_dict)
