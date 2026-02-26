# HomeLedger 后端开发设计文档

## 1. 项目概述

HomeLedger 是一个家庭内部可自由支配资金管理系统，核心目标：

- 管理家庭成员余额
- 支持家庭内部资金流转
- 支持服务交易与悬赏任务
- 支持奖励审批机制
- 提供完整可追溯的资金历史记录

系统采用 **事件驱动账本模型**：

> 余额不是主数据  
> 交易事件才是主数据  
> 余额是历史计算结果

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| Web 框架 | FastAPI |
| 数据库 | PostgreSQL |
| ORM | SQLAlchemy 2.x |
| 数据验证 | Pydantic |
| 数据库迁移 | Alembic |
| 鉴权 | JWT / 微信登录态 |
| 文件存储 | 本地存储（可扩展对象存储） |

---

## 3. 数据库连接配置

数据库类型：PostgreSQL

```
HOST: 115.175.30.67
PORT: 5432
DATABASE: homeledger
USER: postgres
PASSWORD: (开发完成后填写)
```

连接字符串示例：

```
postgresql+psycopg://postgres:密码@115.175.30.67:5432/homeledger
```

环境变量建议：

```
DATABASE_URL=postgresql+psycopg://postgres:password@115.175.30.67:5432/homeledger
```

---

## 4. 系统核心设计原则

### 4.1 事件账本模型

所有余额变化必须来自交易事件：

- 不允许直接修改余额
- 交易记录不可修改，只能追加修正
- 系统可通过历史重建余额

### 4.2 余额快照机制

为提高查询性能，维护余额快照表：

- 事件写入后更新快照
- 快照可删除并重建
- 快照不是权威数据

### 4.3 文件存储策略

数据库只保存对象键（object key），不保存完整 URL。

示例：

```
avatars/{family_id}/{user_id}.png
```

访问地址由后端动态拼接。

---

## 5. 数据模型设计

### 5.1 用户表 users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.2 家庭表 families

```sql
CREATE TABLE families (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_key TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.3 家庭成员关系表 family_members

```sql
CREATE TABLE family_members (
    id UUID PRIMARY KEY,
    family_id UUID REFERENCES families(id),
    user_id UUID REFERENCES users(id),
    role TEXT NOT NULL,
    monthly_quota NUMERIC(12,2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (family_id, user_id)
);
```

---

### 5.4 交易事件表 transaction_events（核心）

```sql
CREATE TABLE transaction_events (
    id UUID PRIMARY KEY,
    family_id UUID REFERENCES families(id),

    event_type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,

    from_member_id UUID REFERENCES family_members(id),
    to_member_id UUID REFERENCES family_members(id),

    reference_id UUID,
    description TEXT,

    status TEXT DEFAULT 'confirmed',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.5 余额快照表 member_balance_snapshots

```sql
CREATE TABLE member_balance_snapshots (
    member_id UUID PRIMARY KEY REFERENCES family_members(id),
    balance NUMERIC(12,2) NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

更新规则：

- 写入事件 → 更新余额
- 可通过历史重建

---

### 5.6 服务表 services

```sql
CREATE TABLE services (
    id UUID PRIMARY KEY,
    family_id UUID REFERENCES families(id),
    title TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    provider_id UUID REFERENCES family_members(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.7 悬赏任务表 bounty_tasks

```sql
CREATE TABLE bounty_tasks (
    id UUID PRIMARY KEY,
    family_id UUID REFERENCES families(id),
    title TEXT NOT NULL,
    reward_amount NUMERIC(12,2) NOT NULL,
    created_by UUID REFERENCES family_members(id),
    assigned_to UUID REFERENCES family_members(id),
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.8 奖励申请表 rewards

```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY,
    family_id UUID REFERENCES families(id),
    member_id UUID REFERENCES family_members(id),
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API 接口设计

### 6.1 用户认证

- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

---

### 6.2 家庭管理

- GET /api/families
- POST /api/families
- GET /api/families/{family_id}
- PUT /api/families/{family_id}
- DELETE /api/families/{family_id}
- POST /api/families/{family_id}/join
- GET /api/families/{family_id}/members
- POST /api/families/{family_id}/members
- DELETE /api/families/{family_id}/members/{member_id}

---

### 6.3 交易管理

注意：交易不可删除或修改金额。

- GET /api/transactions
- POST /api/transactions
- GET /api/transactions/{transaction_id}

---

### 6.4 任务管理

- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/{task_id}
- PUT /api/tasks/{task_id}
- DELETE /api/tasks/{task_id}

---

### 6.5 奖励管理

- GET /api/rewards
- POST /api/rewards
- GET /api/rewards/{reward_id}
- PUT /api/rewards/{reward_id}

---

### 6.6 服务管理

- GET /api/services
- POST /api/services
- GET /api/services/{service_id}
- PUT /api/services/{service_id}
- DELETE /api/services/{service_id}

---

## 7. 交易写入事务流程

系统写入交易的标准流程：

1. 校验权限
2. 检查付款方余额
3. 写入 transaction_events
4. 更新余额快照
5. 提交事务

任何步骤失败 → 回滚

---

## 8. Alembic 数据库迁移

初始化：

```
alembic init migrations
```

生成迁移：

```
alembic revision --autogenerate -m "init tables"
```

执行迁移：

```
alembic upgrade head
```

---

## 9. 项目结构建议

```
backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── core/
│   └── main.py
├── migrations/
├── uploads/
└── requirements.txt
```

---

## 10. 系统一致性规则

1. 余额不可直接修改
2. 所有资金变化必须有事件
3. 交易记录不可删除
4. 快照可重建
5. 数据库只存对象键，不存文件地址

---

## 11. 后续扩展方向

- 统计报表
- 行为分析
- 自动奖励规则
- 信用评分
- 家庭经济报告

---

## 12. 系统本质

HomeLedger 是一个微型制度系统：

记录变化  
约束行为  
保留历史  
通过结构建立信任