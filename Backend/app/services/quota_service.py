from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.core.database import get_db
from app.models.family import FamilyMember
from app.models.transaction import TransactionEvent, MemberBalanceSnapshot
from app.services.balance_service import update_balance_snapshot

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allocate_monthly_quota():
    """每月配额发放"""
    logger.info(f"Starting monthly quota allocation at {datetime.now()}")
    
    db = next(get_db())
    try:
        # 获取所有有每月配额的家庭成员
        members = db.query(FamilyMember).filter(FamilyMember.monthly_quota > 0).all()
        
        logger.info(f"Found {len(members)} members with monthly quota")
        
        for member in members:
            try:
                # 创建配额发放交易事件
                transaction = TransactionEvent(
                    family_id=member.family_id,
                    event_type="quota_allocation",
                    amount=member.monthly_quota,
                    from_member_id=None,  # 配额发放没有付款方
                    to_member_id=member.id,
                    description=f"2026年{datetime.now().month}月配额发放",
                    created_by=member.user_id  # 使用成员自己的ID作为创建者
                )
                db.add(transaction)
                
                # 更新余额快照
                update_balance_snapshot(db, member.id, member.monthly_quota)
                
                logger.info(f"Allocated quota {member.monthly_quota} to member {member.id}")
                
            except Exception as e:
                logger.error(f"Failed to allocate quota to member {member.id}: {str(e)}")
                # 继续处理其他成员
                continue
        
        db.commit()
        logger.info("Monthly quota allocation completed successfully")
        
    except Exception as e:
        logger.error(f"Error in monthly quota allocation: {str(e)}")
        db.rollback()
    finally:
        db.close()

def allocate_quota_manually(member_id: str):
    """手动发放配额"""
    logger.info(f"Manually allocating quota for member {member_id}")
    
    db = next(get_db())
    try:
        # 查找成员
        member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
        if not member:
            logger.error(f"Member {member_id} not found")
            return False
        
        if member.monthly_quota <= 0:
            logger.error(f"Member {member_id} has no monthly quota set")
            return False
        
        # 创建配额发放交易事件
        transaction = TransactionEvent(
            family_id=member.family_id,
            event_type="quota_allocation",
            amount=member.monthly_quota,
            from_member_id=None,
            to_member_id=member.id,
            description=f"手动发放{datetime.now().year}年{datetime.now().month}月配额",
            created_by=member.user_id
        )
        db.add(transaction)
        
        # 更新余额快照
        update_balance_snapshot(db, member.id, member.monthly_quota)
        
        db.commit()
        logger.info(f"Manually allocated quota {member.monthly_quota} to member {member_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error in manual quota allocation: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def allocate_quota_to_all_members(family_id: str):
    """批量发放配额给所有家庭成员"""
    logger.info(f"Batch allocating quota for all members in family {family_id}")
    
    db = next(get_db())
    try:
        # 获取所有有每月配额的家庭成员
        members = db.query(FamilyMember).filter(
            FamilyMember.family_id == family_id,
            FamilyMember.monthly_quota > 0
        ).all()
        
        logger.info(f"Found {len(members)} members with monthly quota in family {family_id}")
        
        if len(members) == 0:
            logger.warning(f"No members with monthly quota found in family {family_id}")
            return True  # 没有成员需要发放配额，也算成功
        
        total_quota = 0
        for member in members:
            try:
                # 创建配额发放交易事件
                transaction = TransactionEvent(
                    family_id=member.family_id,
                    event_type="quota_allocation",
                    amount=member.monthly_quota,
                    from_member_id=None,
                    to_member_id=member.id,
                    description=f"手动批量发放{datetime.now().year}年{datetime.now().month}月配额",
                    created_by=member.user_id
                )
                db.add(transaction)
                
                # 更新余额快照
                update_balance_snapshot(db, member.id, member.monthly_quota)
                
                total_quota += float(member.monthly_quota)
                logger.info(f"Allocated quota {member.monthly_quota} to member {member.id}")
                
            except Exception as e:
                logger.error(f"Failed to allocate quota to member {member.id}: {str(e)}")
                # 继续处理其他成员
                continue
        
        db.commit()
        logger.info(f"Batch allocated total quota {total_quota} to {len(members)} members in family {family_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error in batch quota allocation: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()
