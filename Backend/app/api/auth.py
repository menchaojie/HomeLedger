from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.auth import create_access_token
from app.models.user import User
from app.schemas.auth import Token, TokenData, LoginRequest
from app.schemas.user import User as UserSchema
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """登录"""
    # 这里应该调用微信登录API验证code
    # 为了演示，我们假设用户已经存在
    # 实际开发中需要根据微信返回的openid创建或获取用户
    
    # 模拟用户
    user = db.query(User).first()
    if not user:
        # 创建新用户
        user = User(nickname="测试用户")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    """登出"""
    # 实际开发中需要实现令牌黑名单
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_active_user)):
    """刷新令牌"""
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return current_user
