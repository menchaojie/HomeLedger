from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.family import FamilyMember
from app.models.reward import Reward
from app.schemas.reward import Reward as RewardSchema, RewardCreate, RewardUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[RewardSchema])
def get_rewards(
    family_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取奖励列表"""
    query = db.query(Reward)
    
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
        query = query.filter(Reward.family_id == family_id)
    else:
        # 获取用户参与的所有奖励
        member_ids = [m.id for m in db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()]
        query = query.filter(Reward.member_id.in_(member_ids))
    
    rewards = query.offset(skip).limit(limit).all()
    return rewards


@router.post("", response_model=RewardSchema)
def create_reward(
    reward_data: RewardCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建奖励申请"""
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == reward_data.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 检查申请人是否是家庭成员
    applicant = db.query(FamilyMember).filter(
        FamilyMember.id == reward_data.member_id,
        FamilyMember.family_id == reward_data.family_id
    ).first()
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant not found in this family"
        )
    
    # 创建奖励申请
    reward = Reward(
        family_id=reward_data.family_id,
        member_id=reward_data.member_id,
        amount=reward_data.amount,
        reason=reward_data.reason
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    
    return reward


@router.get("/{reward_id}", response_model=RewardSchema)
def get_reward(
    reward_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取奖励详情"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == reward.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    return reward


@router.put("/{reward_id}", response_model=RewardSchema)
def update_reward(
    reward_id: UUID,
    reward_data: RewardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新奖励状态"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == reward.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 只有管理员可以审批奖励
    if member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can approve or reject rewards"
        )
    
    # 更新奖励状态
    reward.status = reward_data.status
    
    db.commit()
    db.refresh(reward)
    
    return reward
