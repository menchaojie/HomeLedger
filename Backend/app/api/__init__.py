from fastapi import APIRouter

from app.api import auth, family, transaction, task, reward, service

api_router = APIRouter()

# 注册各模块路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(family.router, prefix="/families", tags=["家庭管理"])
api_router.include_router(transaction.router, prefix="/transactions", tags=["交易管理"])
api_router.include_router(task.router, prefix="/tasks", tags=["任务管理"])
api_router.include_router(reward.router, prefix="/rewards", tags=["奖励管理"])
api_router.include_router(service.router, prefix="/services", tags=["服务管理"])
