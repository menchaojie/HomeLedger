from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.message import Message
from app.schemas.message import Message as MessageSchema, MessageCreate, MessageUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[MessageSchema])
def get_user_messages(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取用户消息列表"""
    messages = db.query(Message).filter(
        Message.user_id == current_user.id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    return messages


@router.get("/{message_id}", response_model=MessageSchema)
def get_message(
    message_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取消息详情"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.user_id == current_user.id
    ).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return message


@router.put("/{message_id}", response_model=MessageSchema)
def update_message(
    message_id: UUID,
    message_data: MessageUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新消息状态（标记为已读）"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.user_id == current_user.id
    ).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.read = message_data.read
    db.commit()
    db.refresh(message)
    
    return message


@router.delete("/{message_id}")
def delete_message(
    message_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除消息"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.user_id == current_user.id
    ).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}