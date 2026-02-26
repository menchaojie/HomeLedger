from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.models.user import User
from app.models.family import FamilyMember
from app.models.transaction import TransactionEvent, MemberBalanceSnapshot
from app.schemas.transaction import TransactionEvent as TransactionEventSchema, TransactionEventCreate
from app.core.dependencies import get_current_active_user

router = APIRouter()


def update_balance_snapshot(db: Session, member_id: UUID, amount: float):
    """更新余额快照"""
    snapshot = db.query(MemberBalanceSnapshot).filter(MemberBalanceSnapshot.member_id == member_id).first()
    if not snapshot:
        # 创建新的快照
        snapshot = MemberBalanceSnapshot(
            member_id=member_id,
            balance=amount
        )
        db.add(snapshot)
    else:
        # 更新现有快照
        snapshot.balance += amount
    return snapshot


@router.get("", response_model=List[TransactionEventSchema])
def get_transactions(
    family_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取交易记录"""
    query = db.query(TransactionEvent)
    
    if family_id:
        # 检查用户是否是家庭成员
        member = db.query(FamilyMember).filter(
            FamilyMember.family_id == family_id,
            FamilyMember.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this family"
            )
        query = query.filter(TransactionEvent.family_id == family_id)
    else:
        # 获取用户参与的所有交易
        member_ids = [m.id for m in db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()]
        query = query.filter(
            or_(
                TransactionEvent.from_member_id.in_(member_ids),
                TransactionEvent.to_member_id.in_(member_ids)
            )
        )
    
    transactions = query.offset(skip).limit(limit).all()
    return transactions


@router.post("", response_model=TransactionEventSchema)
def create_transaction(
    transaction_data: TransactionEventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建交易记录"""
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == transaction_data.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 检查付款方余额（如果有）
    if transaction_data.from_member_id:
        from_member = db.query(FamilyMember).filter(FamilyMember.id == transaction_data.from_member_id).first()
        if not from_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="From member not found"
            )
        
        # 检查余额
        snapshot = db.query(MemberBalanceSnapshot).filter(MemberBalanceSnapshot.member_id == from_member.id).first()
        if snapshot and snapshot.balance < transaction_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )
    
    # 检查收款方
    if transaction_data.to_member_id:
        to_member = db.query(FamilyMember).filter(FamilyMember.id == transaction_data.to_member_id).first()
        if not to_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="To member not found"
            )
    
    # 创建交易事件
    transaction = TransactionEvent(
        family_id=transaction_data.family_id,
        event_type=transaction_data.event_type,
        amount=transaction_data.amount,
        from_member_id=transaction_data.from_member_id,
        to_member_id=transaction_data.to_member_id,
        reference_id=transaction_data.reference_id,
        description=transaction_data.description,
        created_by=current_user.id
    )
    db.add(transaction)
    
    # 更新余额快照
    if transaction_data.from_member_id:
        update_balance_snapshot(db, transaction_data.from_member_id, -transaction_data.amount)
    if transaction_data.to_member_id:
        update_balance_snapshot(db, transaction_data.to_member_id, transaction_data.amount)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.get("/{transaction_id}", response_model=TransactionEventSchema)
def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取交易详情"""
    transaction = db.query(TransactionEvent).filter(TransactionEvent.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == transaction.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    return transaction
