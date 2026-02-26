from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Service(Base):
    """服务表"""
    __tablename__ = "services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=False)
    title = Column(String, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id"), nullable=False)
    status = Column(String, default="active")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # 关系
    family = relationship("Family", backref="services")
    provider = relationship("FamilyMember", backref="provided_services")
