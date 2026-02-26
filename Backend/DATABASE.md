# HomeLedger 数据库管理说明

## 数据库概述

HomeLedger 使用 PostgreSQL 作为数据库，通过 SQLAlchemy ORM 进行数据操作，使用 Alembic 进行数据库迁移管理。

## 数据库表结构

### 1. users 表 (用户表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 用户ID | 主键，自增 |
| username | String(50) | 用户名 | 唯一，非空 |
| email | String(100) | 邮箱 | 唯一，非空 |
| hashed_password | String(255) | 加密密码 | 非空 |
| nickname | String(50) | 昵称 | 非空 |
| avatar_url | String(255) | 头像URL | 可空 |
| created_at | DateTime | 创建时间 | 默认当前时间 |
| updated_at | DateTime | 更新时间 | 默认当前时间 |

### 2. families 表 (家庭表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 家庭ID | 主键，自增 |
| name | String(100) | 家庭名称 | 非空 |
| description | Text | 家庭描述 | 可空 |
| avatar_url | String(255) | 家庭头像 | 可空 |
| monthly_allowance | Numeric(10,2) | 每月额度 | 默认0 |
| created_by | Integer | 创建者ID | 外键 users.id |
| created_at | DateTime | 创建时间 | 默认当前时间 |
| updated_at | DateTime | 更新时间 | 默认当前时间 |

### 3. family_members 表 (家庭成员表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 成员关系ID | 主键，自增 |
| family_id | Integer | 家庭ID | 外键 families.id |
| user_id | Integer | 用户ID | 外键 users.id |
| role | String(20) | 角色 | admin/member，默认member |
| joined_at | DateTime | 加入时间 | 默认当前时间 |
| status | String(20) | 状态 | active/inactive，默认active |

### 4. transaction_events 表 (交易事件表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 交易ID | 主键，自增 |
| family_id | Integer | 家庭ID | 外键 families.id |
| from_member_id | Integer | 付款成员ID | 外键 family_members.id |
| to_member_id | Integer | 收款成员ID | 外键 family_members.id |
| amount | Numeric(10,2) | 交易金额 | 非空 |
| description | Text | 交易描述 | 可空 |
| transaction_type | String(50) | 交易类型 | service_purchase/task_reward/reward_application |
| related_service_id | Integer | 关联服务ID | 外键 services.id |
| related_task_id | Integer | 关联任务ID | 外键 bounty_tasks.id |
| related_reward_id | Integer | 关联奖励ID | 外键 rewards.id |
| created_at | DateTime | 创建时间 | 默认当前时间 |

### 5. member_balance_snapshots 表 (余额快照表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 快照ID | 主键，自增 |
| family_member_id | Integer | 成员ID | 外键 family_members.id |
| balance | Numeric(10,2) | 余额 | 非空 |
| snapshot_date | Date | 快照日期 | 非空 |
| created_at | DateTime | 创建时间 | 默认当前时间 |

### 6. services 表 (服务表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 服务ID | 主键，自增 |
| family_id | Integer | 家庭ID | 外键 families.id |
| name | String(100) | 服务名称 | 非空 |
| description | Text | 服务描述 | 可空 |
| price | Numeric(10,2) | 服务价格 | 非空 |
| category | String(50) | 服务分类 | 非空 |
| is_active | Boolean | 是否激活 | 默认true |
| created_by | Integer | 创建者ID | 外键 family_members.id |
| created_at | DateTime | 创建时间 | 默认当前时间 |
| updated_at | DateTime | 更新时间 | 默认当前时间 |

### 7. bounty_tasks 表 (悬赏任务表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 任务ID | 主键，自增 |
| family_id | Integer | 家庭ID | 外键 families.id |
| title | String(200) | 任务标题 | 非空 |
| description | Text | 任务描述 | 可空 |
| reward_amount | Numeric(10,2) | 奖励金额 | 非空 |
| status | String(20) | 任务状态 | open/assigned/completed/cancelled |
| created_by | Integer | 创建者ID | 外键 family_members.id |
| assigned_to | Integer | 分配对象ID | 外键 family_members.id |
| completed_at | DateTime | 完成时间 | 可空 |
| created_at | DateTime | 创建时间 | 默认当前时间 |
| updated_at | DateTime | 更新时间 | 默认当前时间 |

### 8. rewards 表 (奖励申请表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 奖励ID | 主键，自增 |
| family_id | Integer | 家庭ID | 外键 families.id |
| applicant_id | Integer | 申请人ID | 外键 family_members.id |
| amount | Numeric(10,2) | 奖励金额 | 非空 |
| reason | String(200) | 奖励原因 | 非空 |
| description | Text | 详细说明 | 可空 |
| status | String(20) | 申请状态 | pending/approved/rejected |
| reviewed_by | Integer | 审核人ID | 外键 family_members.id |
| reviewed_at | DateTime | 审核时间 | 可空 |
| created_at | DateTime | 创建时间 | 默认当前时间 |
| updated_at | DateTime | 更新时间 | 默认当前时间 |

## 数据库初始化

### 1. 创建数据库

```sql
-- 连接到 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE homeledger;

-- 创建用户（可选）
CREATE USER homeledger_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE homeledger TO homeledger_user;
```

### 2. 配置环境变量

创建 `.env` 文件并配置数据库连接：

```env
DATABASE_URL=postgresql://homeledger_user:your_password@localhost:5432/homeledger
```

### 3. 运行数据库迁移

```bash
# 生成初始迁移文件
alembic revision --autogenerate -m "init tables"

# 应用迁移
alembic upgrade head
```

### 4. 验证数据库

```bash
# 连接到数据库验证表结构
psql -U homeledger_user -d homeledger -c "\dt"
```

## 数据库管理操作

### 备份数据库

```bash
# 备份整个数据库
pg_dump -U homeledger_user homeledger > homeledger_backup_$(date +%Y%m%d).sql

# 备份特定表
pg_dump -U homeledger_user -t users -t families homeledger > tables_backup.sql
```

### 恢复数据库

```bash
# 恢复整个数据库
psql -U homeledger_user homeledger < homeledger_backup.sql

# 从备份创建新数据库
createdb -U postgres homeledger_restore
psql -U homeledger_user homeledger_restore < homeledger_backup.sql
```

### 数据库维护

```bash
# 分析数据库性能
psql -U homeledger_user homeledger -c "ANALYZE;"

# 清理数据库
psql -U homeledger_user homeledger -c "VACUUM;"

# 重新索引
psql -U homeledger_user homeledger -c "REINDEX DATABASE homeledger;"
```

## 迁移管理

### 创建新的迁移

```bash
# 1. 修改数据模型
# 编辑 app/models/ 下的模型文件

# 2. 生成迁移文件
alembic revision --autogenerate -m "add_new_feature"

# 3. 检查生成的迁移文件
# 查看 migrations/versions/ 下的新文件

# 4. 应用迁移
alembic upgrade head
```

### 迁移操作命令

```bash
# 查看当前迁移状态
alembic current

# 查看迁移历史
alembic history

# 升级到最新版本
alembic upgrade head

# 升级到特定版本
alembic upgrade <version_id>

# 回滚一个版本
alembic downgrade -1

# 回滚到特定版本
alembic downgrade <version_id>

# 回滚到初始状态
alembic downgrade base
```

### 解决迁移冲突

如果迁移出现冲突，可以：

1. **检查冲突原因**
   ```bash
   alembic current
   alembic history
   ```

2. **手动解决冲突**
   - 编辑冲突的迁移文件
   - 或创建新的迁移文件覆盖

3. **强制标记当前版本**
   ```bash
   alembic stamp <version_id>
   ```

## 性能优化

### 索引优化

建议为以下字段创建索引：

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 家庭表索引
CREATE INDEX idx_families_created_by ON families(created_by);

-- 交易表索引
CREATE INDEX idx_transactions_family_id ON transaction_events(family_id);
CREATE INDEX idx_transactions_created_at ON transaction_events(created_at);
CREATE INDEX idx_transactions_type ON transaction_events(transaction_type);

-- 余额快照表索引
CREATE INDEX idx_balance_snapshots_member_id ON member_balance_snapshots(family_member_id);
CREATE INDEX idx_balance_snapshots_date ON member_balance_snapshots(snapshot_date);
```

### 查询优化建议

1. **避免 N+1 查询**
   - 使用 SQLAlchemy 的 eager loading
   - 使用 `joinedload` 或 `selectinload`

2. **分页查询**
   - 使用 `limit` 和 `offset` 进行分页
   - 避免一次性加载大量数据

3. **定期清理数据**
   - 归档历史交易记录
   - 清理过期的会话数据

## 安全考虑

### 数据库安全

1. **使用强密码**
   - 数据库用户密码应足够复杂
   - 定期更换密码

2. **网络隔离**
   - 生产环境数据库不应直接暴露在公网
   - 使用 VPN 或私有网络访问

3. **权限控制**
   - 为应用创建专用数据库用户
   - 限制用户权限到最小必要范围

### 数据加密

1. **密码加密**
   - 使用 bcrypt 加密用户密码
   - 密码不应以明文存储

2. **敏感数据**
   - 考虑加密存储敏感个人信息
   - 使用数据库加密功能

## 监控和日志

### 数据库监控

```sql
-- 查看数据库连接数
SELECT count(*) FROM pg_stat_activity;

-- 查看表大小
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(table_name)) as size
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name) DESC;

-- 查看索引使用情况
SELECT 
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes;
```

### 应用日志

应用会记录数据库操作日志，包括：
- 数据库连接状态
- SQL 查询性能
- 错误和异常信息

## 故障排除

### 常见问题

1. **连接失败**
   ```bash
   # 检查 PostgreSQL 服务状态
   systemctl status postgresql
   
   # 检查端口监听
   netstat -tlnp | grep 5432
   ```

2. **迁移失败**
   ```bash
   # 查看迁移错误详情
   alembic upgrade head --sql
   
   # 检查数据库权限
   psql -U postgres -c "\l"
   ```

3. **性能问题**
   ```sql
   -- 查看慢查询
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### 联系支持

如遇数据库相关问题，请联系开发团队提供：
- 错误日志
- 数据库版本信息
- 操作系统环境