from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.family import Family, FamilyMember
from app.schemas.family import Family as FamilySchema, FamilyCreate, FamilyUpdate, FamilyMember as FamilyMemberSchema, FamilyMemberCreate, FamilyMemberUpdate
from app.core.dependencies import get_current_active_user
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=List[FamilySchema])
def get_families(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取家庭列表"""
    # 获取用户参与的所有家庭
    families = db.query(Family).join(FamilyMember).filter(FamilyMember.user_id == current_user.id).offset(skip).limit(limit).all()
    return families


@router.post("", response_model=FamilySchema)
def create_family(
    family_data: FamilyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建家庭"""
    # 检查用户是否已经属于其他家庭
    existing_member = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only belong to one family"
        )
    
    # 创建家庭
    family = Family(
        name=family_data.name,
        avatar_key=family_data.avatar_key,
        created_by=current_user.id
    )
    db.add(family)
    db.commit()
    db.refresh(family)
    
    # 添加创建者为管理员
    member = FamilyMember(
        family_id=family.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)
    db.commit()
    
    return family


@router.get("/{family_id}", response_model=FamilySchema)
def get_family(
    family_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取家庭详情"""
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
    
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found"
        )
    
    return family


@router.put("/{family_id}", response_model=FamilySchema)
def update_family(
    family_id: UUID,
    family_data: FamilyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新家庭信息"""
    # 检查用户是否是家庭管理员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == current_user.id,
        FamilyMember.role == "admin"
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not an admin of this family"
        )
    
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found"
        )
    
    # 更新家庭信息
    if family_data.name is not None:
        family.name = family_data.name
    if family_data.avatar_key is not None:
        family.avatar_key = family_data.avatar_key
    
    db.commit()
    db.refresh(family)
    
    return family


@router.delete("/{family_id}")
def delete_family(
    family_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除家庭"""
    # 检查用户是否是家庭创建者
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found"
        )
    
    if family.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can delete the family"
        )
    
    db.delete(family)
    db.commit()
    
    return {"message": "Family deleted successfully"}


@router.post("/{family_id}/join")
def join_family(
    family_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """加入家庭"""
    # 检查用户是否已经属于其他家庭
    existing_member = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only belong to one family"
        )
    
    # 检查家庭是否存在
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found"
        )
    
    # 检查用户是否已经是家庭成员
    existing_member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this family"
        )
    
    # 添加用户为家庭成员
    member = FamilyMember(
        family_id=family_id,
        user_id=current_user.id,
        role="member"
    )
    db.add(member)
    db.commit()
    
    return {"message": "Joined family successfully"}


@router.get("/{family_id}/members")
def get_family_members(
    family_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取家庭成员列表"""
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
    
    # 关联查询获取完整的成员信息
    members = db.query(FamilyMember, User).join(
        User, FamilyMember.user_id == User.id
    ).filter(FamilyMember.family_id == family_id).all()
    
    # 导入余额快照模型
    from app.models.transaction import MemberBalanceSnapshot
    
    # 构建响应数据
    member_list = []
    for family_member, user in members:
        # 构建与UserSchema相同格式的avatar URL
        avatar = f"{settings.server_domain}{settings.static_url}/avatars/{user.avatar_key}" if user.avatar_key else None
        
        # 获取成员余额
        balance_snapshot = db.query(MemberBalanceSnapshot).filter(
            MemberBalanceSnapshot.member_id == family_member.id
        ).first()
        balance = float(balance_snapshot.balance) if balance_snapshot else 0.0
        
        member_data = {
            "id": family_member.id,
            "family_id": family_member.family_id,
            "user_id": family_member.user_id,
            "role": family_member.role,
            "user_role": user.role,  # 添加用户的role信息
            "monthly_quota": family_member.monthly_quota,
            "joined_at": family_member.joined_at,
            "user_name": user.user_name,
            "nickname": user.nickname,
            "avatar": avatar,  # 添加与UserSchema相同格式的avatar字段
            "balance": balance,  # 从余额快照表获取实际余额
            "is_current_user": family_member.user_id == current_user.id  # 添加是否是当前用户
        }
        member_list.append(member_data)
    
    return member_list


@router.post("/{family_id}/members", response_model=FamilyMemberSchema)
def add_family_member(
    family_id: UUID,
    member_data: FamilyMemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """添加家庭成员"""
    # 检查用户是否是家庭管理员
    admin_member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == current_user.id,
        FamilyMember.role == "admin"
    ).first()
    if not admin_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not an admin of this family"
        )
    
    # 检查用户是否已经是家庭成员
    existing_member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == member_data.user_id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this family"
        )
    
    # 添加家庭成员
    member = FamilyMember(
        family_id=family_id,
        user_id=member_data.user_id,
        role=member_data.role,
        monthly_quota=member_data.monthly_quota
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member


@router.put("/{family_id}/members/{member_id}")
def update_family_member(
    family_id: UUID,
    member_id: UUID,
    member_data: FamilyMemberUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新家庭成员信息"""
    # 检查用户是否是家庭管理员
    admin_member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == current_user.id,
        FamilyMember.role == "admin"
    ).first()
    if not admin_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not an admin of this family"
        )
    
    # 检查成员是否存在
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.family_id == family_id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # 更新成员信息
    if member_data.role is not None:
        member.role = member_data.role
    if member_data.monthly_quota is not None:
        member.monthly_quota = member_data.monthly_quota
    
    db.commit()
    db.refresh(member)
    
    return member


@router.delete("/{family_id}/members/{member_id}")
def remove_family_member(
    family_id: UUID,
    member_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """移除家庭成员"""
    # 检查用户是否是家庭管理员
    admin_member = db.query(FamilyMember).filter(
        FamilyMember.family_id == family_id,
        FamilyMember.user_id == current_user.id,
        FamilyMember.role == "admin"
    ).first()
    if not admin_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not an admin of this family"
        )
    
    # 检查成员是否存在
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.family_id == family_id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    # 不允许移除创建者
    family = db.query(Family).filter(Family.id == family_id).first()
    if member.user_id == family.created_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the family creator"
        )
    
    db.delete(member)
    db.commit()
    
    return {"message": "Member removed successfully"}
