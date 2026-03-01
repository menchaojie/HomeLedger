from sqlalchemy.orm import Session
from app.models.transaction import MemberBalanceSnapshot

def update_balance_snapshot(db: Session, member_id: str, amount_change: float):
    """更新余额快照"""
    # 查找现有快照
    snapshot = db.query(MemberBalanceSnapshot).filter(MemberBalanceSnapshot.member_id == member_id).first()
    
    if snapshot:
        # 更新现有快照
        snapshot.balance += amount_change
    else:
        # 创建新快照
        snapshot = MemberBalanceSnapshot(
            member_id=member_id,
            balance=amount_change
        )
        db.add(snapshot)
    
    return snapshot
