from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.family import FamilyMember
from app.models.service import Service
from app.schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[ServiceSchema])
def get_services(
    family_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取服务列表"""
    query = db.query(Service).filter(Service.status == "active")
    
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
        query = query.filter(Service.family_id == family_id)
    else:
        # 获取用户参与的所有服务
        member_ids = [m.id for m in db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()]
        query = query.filter(Service.provider_id.in_(member_ids))
    
    services = query.offset(skip).limit(limit).all()
    return services


@router.post("", response_model=ServiceSchema)
def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建服务"""
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == service_data.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 检查提供者是否是家庭成员
    provider = db.query(FamilyMember).filter(
        FamilyMember.id == service_data.provider_id,
        FamilyMember.family_id == service_data.family_id
    ).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found in this family"
        )
    
    # 创建服务
    service = Service(
        family_id=service_data.family_id,
        title=service_data.title,
        price=service_data.price,
        provider_id=service_data.provider_id
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service


@router.get("/{service_id}", response_model=ServiceSchema)
def get_service(
    service_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取服务详情"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == service.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    return service


@router.put("/{service_id}", response_model=ServiceSchema)
def update_service(
    service_id: UUID,
    service_data: ServiceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新服务信息"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == service.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 只有提供者或管理员可以更新服务
    provider = db.query(FamilyMember).filter(FamilyMember.id == service.provider_id).first()
    if provider.user_id != current_user.id and member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the provider or admin can update the service"
        )
    
    # 更新服务信息
    if service_data.title is not None:
        service.title = service_data.title
    if service_data.price is not None:
        service.price = service_data.price
    if service_data.status is not None:
        service.status = service_data.status
    
    db.commit()
    db.refresh(service)
    
    return service


@router.delete("/{service_id}")
def delete_service(
    service_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除服务"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # 检查用户是否是家庭成员
    member = db.query(FamilyMember).filter(
        FamilyMember.family_id == service.family_id,
        FamilyMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this family"
        )
    
    # 只有提供者或管理员可以删除服务
    provider = db.query(FamilyMember).filter(FamilyMember.id == service.provider_id).first()
    if provider.user_id != current_user.id and member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the provider or admin can delete the service"
        )
    
    db.delete(service)
    db.commit()
    
    return {"message": "Service deleted successfully"}
