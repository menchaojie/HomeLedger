from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

from app.services.quota_service import allocate_monthly_quota

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建调度器
scheduler = BackgroundScheduler()

def start_scheduler():
    """启动调度器"""
    # 每月1号凌晨0点执行配额发放
    scheduler.add_job(
        allocate_monthly_quota,
        CronTrigger(day=1, hour=0, minute=0),
        id='monthly_quota_allocation',
        name='Monthly quota allocation',
        replace_existing=True
    )
    
    # 每天检查发放状态
    scheduler.add_job(
        check_quota_allocation_status,
        CronTrigger(hour=12, minute=0),
        id='check_quota_status',
        name='Check quota allocation status',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started successfully")

def stop_scheduler():
    """停止调度器"""
    scheduler.shutdown()
    logger.info("Scheduler stopped successfully")

def check_quota_allocation_status():
    """检查配额发放状态"""
    # 这里可以实现检查逻辑，例如查看最近的发放记录
    # 如果发现发放失败，可以通知管理员
    logger.info(f"Checking quota allocation status at {datetime.now()}")
    # 具体实现可以根据需要扩展
