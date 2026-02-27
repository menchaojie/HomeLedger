from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from pydantic import BaseModel
import os

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
    existing_user = db.query(User).filter(User.user_name == register_data.username).first()
    if existing_user:
        print(f"注册失败 - 用户名已存在: {register_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建新用户
    user = User(
        nickname="",  # 昵称默认为空
        user_name=register_data.username,  # 用户名存储到 user_name 字段
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
        # 只在 user_name 字段中查找用户
        user = db.query(User).filter(User.user_name == login_data.username).first()
        # 如果找不到，返回错误
        if not user:
            print(f"登录失败 - 找不到用户: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )
        
        # 验证密码
        print(f"登录验证 - 用户名: {login_data.username}, 用户ID: {user.id if user else '无'}")
        if not user.check_password(login_data.password):
            print(f"登录失败 - 密码验证失败: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )
        
        print(f"用户登录成功: {user.user_name or user.nickname} (ID: {user.id})")
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
    return UserSchema.from_orm(current_user)


from app.schemas.user import UserUpdate

@router.put("/me", response_model=UserSchema)
def update_user_info(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    print(f"更新用户信息 - 用户ID: {current_user.id}")
    print(f"更新用户信息 - 收到的数据: {update_data.dict()}")
    
    # 更新用户信息
    if update_data.nickname is not None:
        current_user.nickname = update_data.nickname
        print(f"更新用户信息 - 昵称: {update_data.nickname}")
    if hasattr(update_data, 'user_name') and update_data.user_name is not None:
        current_user.user_name = update_data.user_name
        print(f"更新用户信息 - 用户名: {update_data.user_name}")
    if hasattr(update_data, 'message') and update_data.message is not None:
        current_user.message = update_data.message
        print(f"更新用户信息 - 留言: {update_data.message}")
    if hasattr(update_data, 'phone') and update_data.phone is not None:
        current_user.phone = update_data.phone
        print(f"更新用户信息 - 手机号: {update_data.phone}")
    if hasattr(update_data, 'email') and update_data.email is not None:
        current_user.email = update_data.email
        print(f"更新用户信息 - 邮箱: {update_data.email}")
    if hasattr(update_data, 'role') and update_data.role is not None:
        current_user.role = update_data.role
        print(f"更新用户信息 - 角色: {update_data.role}")
    
    db.commit()
    db.refresh(current_user)
    
    return UserSchema.from_orm(current_user)


class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str

@router.put("/me/password")
def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """修改密码"""
    print(f"修改密码 - 用户ID: {current_user.id}")
    print(f"修改密码 - 收到的数据: {password_data.dict()}")
    
    # 验证旧密码
    if not current_user.check_password(password_data.old_password):
        print(f"修改密码 - 旧密码验证失败")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="旧密码错误"
        )
    
    # 设置新密码
    current_user.set_password(password_data.new_password)
    db.commit()
    print(f"修改密码 - 密码更新成功")
    
    return {"message": "密码修改成功"}


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    print(f"上传头像 - 用户ID: {current_user.id}")
    print(f"上传头像 - 文件名: {file.filename}")
    
    # 确保上传目录存在
    upload_dir = "app/static/avatars"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # 生成唯一的文件名
    file_extension = os.path.splitext(file.filename)[1]
    avatar_key = f"{current_user.id}{file_extension}"
    file_path = os.path.join(upload_dir, avatar_key)
    
    # 保存文件
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # 更新用户的avatar_key
        current_user.avatar_key = avatar_key
        db.commit()
        db.refresh(current_user)
        
        print(f"上传头像 - 成功: {avatar_key}")
        return {"message": "头像上传成功", "avatar_key": avatar_key, "avatar_url": f"http://127.0.0.1:8000/static/avatars/{avatar_key}"}
    except Exception as e:
        print(f"上传头像 - 失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="头像上传失败"
        )
