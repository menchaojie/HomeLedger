from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class BountyTask(Base):
    """悬赏任务表"""
    __tablename__ = "bounty_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=False)
    title = Column(String, nullable=False)
    reward_amount = Column(Numeric(12, 2), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=True)
    status = Column(String, default="open")  # open, in_progress, completed, cancelled
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 关系
    family = relationship("Family", backref="bounty_tasks")
    creator = relationship("FamilyMember", foreign_keys=[created_by], backref="created_tasks")
    assignee = relationship("FamilyMember", foreign_keys=[assigned_to], backref="assigned_tasks")
