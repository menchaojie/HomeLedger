from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Family(Base):
    """家庭表"""
    __tablename__ = "families"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    avatar_key = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 关系
    creator = relationship("User", backref="created_families")
    members = relationship("FamilyMember", back_populates="family", cascade="all, delete-orphan")


class FamilyMember(Base):
    """家庭成员关系表"""
    __tablename__ = "family_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # admin 或 member
    monthly_quota = Column(Numeric(12, 2), default=0)
    joined_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 唯一约束
    __table_args__ = (
        UniqueConstraint('family_id', 'user_id', name='_family_user_uc'),
    )
    
    # 关系
    family = relationship("Family", back_populates="members")
    user = relationship("User", backref="family_memberships")
