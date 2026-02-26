from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.family import FamilyMember
from app.models.task import BountyTask
from app.schemas.task import BountyTask as BountyTaskSchema, BountyTaskCreate, BountyTaskUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[BountyTaskSchema])
def get_tasks(
    family_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取任务列表"""
    query = db.query(BountyTask)
    
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
        query = query.filter(BountyTask.family_id == family_id)
    else:
        # 获取用户参与的所有任务
        member_ids = [m.id for m in db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()]
        query = query.filter(
            (BountyTask.created_by.in_(member_ids)) | (BountyTask.assigned_to.in_(member_ids))
        )
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.post("", response_model=BountyTaskSchema)
def create_task(
    task_data: BountyTaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建任务"""
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == task_data.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 检查创建者是否是家庭成员
    creator = db.query(FamilyMember).filter(
        FamilyMember.id == task_data.created_by,
        FamilyMember.family_id == task_data.family_id
    ).first()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found in this family"
        )
    
    # 检查被分配者是否是家庭成员（如果有）
    if task_data.assigned_to:
        assignee = db.query(FamilyMember).filter(
            FamilyMember.id == task_data.assigned_to,
            FamilyMember.family_id == task_data.family_id
        ).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found in this family"
            )
    
    # 创建任务
    task = BountyTask(
        family_id=task_data.family_id,
        title=task_data.title,
        reward_amount=task_data.reward_amount,
        created_by=task_data.created_by,
        assigned_to=task_data.assigned_to
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task


@router.get("/{task_id}", response_model=BountyTaskSchema)
def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取任务详情"""
    task = db.query(BountyTask).filter(BountyTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == task.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    return task


@router.put("/{task_id}", response_model=BountyTaskSchema)
def update_task(
    task_id: UUID,
    task_data: BountyTaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新任务状态"""
    task = db.query(BountyTask).filter(BountyTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == task.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 更新任务信息
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.reward_amount is not None:
        task.reward_amount = task_data.reward_amount
    if task_data.assigned_to is not None:
        # 检查被分配者是否是家庭成员
        assignee = db.query(FamilyMember).filter(
            FamilyMember.id == task_data.assigned_to,
            FamilyMember.family_id == task.family_id
        ).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found in this family"
            )
        task.assigned_to = task_data.assigned_to
    if task_data.status is not None:
        task.status = task_data.status
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除任务"""
    task = db.query(BountyTask).filter(BountyTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == task.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 只有创建者或管理员可以删除任务
    creator_member = db.query(FamilyMember).filter(
        FamilyMember.id == task.created_by
    ).first()
    if creator_member.user_id != current_user.id and member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator or admin can delete the task"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}
