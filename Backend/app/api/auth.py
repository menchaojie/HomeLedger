from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.auth import create_access_token
from app.models.user import User
from app.schemas.auth import Token, TokenData, LoginRequest, RegisterRequest
from app.schemas.user import User as UserSchema
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.post("/register", response_model=Token)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """注册"""
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.nickname == register_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建新用户
    user = User(
        nickname=register_data.username,
        phone=register_data.phone,
        email=register_data.email,
        role=register_data.role
    )
    
    # 设置密码
    user.set_password(register_data.password)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    print(f"新用户注册: {user.nickname} (ID: {user.id})")
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """登录"""
    # 用户名密码登录
    if login_data.username and login_data.password:
        # 根据用户名查找用户
        user = db.query(User).filter(User.nickname == login_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )
        
        # 验证密码
        if not user.check_password(login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )
        
        print(f"用户登录: {user.nickname} (ID: {user.id})")
    # 处理微信登录
    elif login_data.code:
        # 这里应该调用微信登录API验证code
        # 为了演示，我们假设用户已经存在
        user = db.query(User).first()
        if not user:
            # 创建新用户
            user = User(nickname="微信用户")
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password or code is required"
        )
    
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
