from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class TransactionEvent(Base):
    """交易事件表"""
    __tablename__ = "transaction_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=False)
    event_type = Column(String, nullable=False)  # service, task, reward, transfer
    amount = Column(Numeric(12, 2), nullable=False)
    from_member_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=True)
    to_member_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=True)
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # 关联服务、任务或奖励ID
    description = Column(String, nullable=True)
    status = Column(String, default="confirmed")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 关系
    family = relationship("Family", backref="transactions")
    from_member = relationship("FamilyMember", foreign_keys=[from_member_id], backref="sent_transactions")
    to_member = relationship("FamilyMember", foreign_keys=[to_member_id], backref="received_transactions")
    creator = relationship("User", backref="created_transactions")


class MemberBalanceSnapshot(Base):
    """余额快照表"""
    __tablename__ = "member_balance_snapshots"
    
    member_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), primary_key=True)
    balance = Column(Numeric(12, 2), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    
    # 关系
    member = relationship("FamilyMember", backref="balance_snapshot")
