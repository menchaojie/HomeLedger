from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Reward(Base):
    """奖励申请表"""
    __tablename__ = "rewards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 关系
    family = relationship("Family", backref="rewards")
    member = relationship("FamilyMember", backref="reward_applications")
