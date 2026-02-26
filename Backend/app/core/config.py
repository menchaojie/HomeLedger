from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    # 应用基本信息
    app_name: str = "HomeLedger"
    app_version: str = "1.0.0"
    
    # 数据库配置
    database_url: str
    
    # JWT配置
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # 文件存储配置
    upload_dir: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
