from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import hashlib

from app.core.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nickname = Column(String, nullable=False)
    avatar_key = Column(String, nullable=True)
    # 密码哈希值
    password_hash = Column(String, nullable=True)
    # 用户信息
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    role = Column(String, nullable=True)  # 家庭角色：爸爸、妈妈、孩子等
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    def set_password(self, password: str):
        """设置密码（存储哈希值）"""
        # 简单的密码哈希，实际项目中应该使用更安全的哈希算法
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password: str) -> bool:
        """验证密码"""
        if not self.password_hash:
            return False
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()
