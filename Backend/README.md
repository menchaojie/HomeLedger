# HomeLedger 后端使用说明

## 项目概述

HomeLedger 后端是一个基于 FastAPI 的家庭账本管理系统后端服务，提供用户认证、家庭管理、交易记录、任务管理、奖励系统和服务管理等功能。

## 技术栈

- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **数据库迁移**: Alembic
- **数据验证**: Pydantic
- **认证**: JWT
- **密码加密**: passlib[bcrypt]

## 快速开始

### 1. 环境要求

- Python 3.8+
- PostgreSQL 12+
- pip (Python 包管理器)

### 2. 安装依赖

```bash
# 使用阿里云国内源安装依赖
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
```

### 3. 环境配置

复制 `.env.example` 文件为 `.env` 并配置数据库连接信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下环境变量：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/homeledger

# JWT 配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 应用配置
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. 数据库初始化

```bash
# 创建数据库迁移文件
alembic revision --autogenerate -m "init tables"

# 应用数据库迁移
alembic upgrade head
```

### 5. 启动服务

```bash
# 开发模式启动
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

服务启动后，访问以下地址：
- API 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc

## API 接口说明

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "nickname": "测试用户"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

#### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 家庭管理接口

#### 获取家庭列表
```http
GET /api/families
Authorization: Bearer <token>
```

#### 创建家庭
```http
POST /api/families
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "我的家庭",
  "description": "这是一个测试家庭"
}
```

#### 加入家庭
```http
POST /api/families/{family_id}/join
Authorization: Bearer <token>
```

### 交易管理接口

#### 获取交易记录
```http
GET /api/transactions
Authorization: Bearer <token>
```

#### 创建交易记录
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "family_id": 1,
  "amount": 100.0,
  "description": "购买服务",
  "transaction_type": "service_purchase"
}
```

### 任务管理接口

#### 获取任务列表
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### 创建任务
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "family_id": 1,
  "title": "打扫卫生",
  "description": "打扫客厅和厨房",
  "reward_amount": 50.0
}
```

### 奖励管理接口

#### 获取奖励列表
```http
GET /api/rewards
Authorization: Bearer <token>
```

#### 创建奖励申请
```http
POST /api/rewards
Authorization: Bearer <token>
Content-Type: application/json

{
  "family_id": 1,
  "amount": 100.0,
  "reason": "完成重要任务",
  "description": "详细说明奖励原因"
}
```

### 服务管理接口

#### 获取服务列表
```http
GET /api/services
Authorization: Bearer <token>
```

#### 创建服务
```http
POST /api/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "外卖服务",
  "description": "提供外卖配送服务",
  "price": 20.0,
  "category": "delivery"
}
```

## 项目结构

```
Backend/
├── app/                    # 应用主目录
│   ├── api/               # API 路由
│   │   ├── auth.py        # 认证路由
│   │   ├── family.py      # 家庭管理路由
│   │   ├── transaction.py # 交易管理路由
│   │   ├── task.py        # 任务管理路由
│   │   ├── reward.py      # 奖励管理路由
│   │   └── service.py     # 服务管理路由
│   ├── core/              # 核心配置
│   │   ├── config.py      # 应用配置
│   │   ├── database.py    # 数据库配置
│   │   ├── auth.py        # 认证逻辑
│   │   └── dependencies.py # 依赖注入
│   ├── models/            # 数据模型
│   │   ├── user.py        # 用户模型
│   │   ├── family.py      # 家庭模型
│   │   ├── transaction.py # 交易模型
│   │   ├── task.py        # 任务模型
│   │   ├── reward.py      # 奖励模型
│   │   └── service.py     # 服务模型
│   ├── schemas/           # Pydantic 模式
│   │   ├── auth.py        # 认证模式
│   │   ├── user.py        # 用户模式
│   │   ├── family.py      # 家庭模式
│   │   ├── transaction.py # 交易模式
│   │   ├── task.py        # 任务模式
│   │   ├── reward.py      # 奖励模式
│   │   └── service.py     # 服务模式
│   └── main.py            # 应用入口
├── migrations/            # 数据库迁移
│   ├── env.py            # 迁移环境配置
│   └── versions/         # 迁移版本文件
├── .env                   # 环境变量配置
├── .env.example          # 环境变量示例
├── alembic.ini           # Alembic 配置
└── requirements.txt       # 项目依赖
```

## 开发指南

### 添加新的 API 路由

1. 在 `app/api/` 目录下创建新的路由文件
2. 在 `app/main.py` 中注册路由
3. 创建对应的数据模型和 Pydantic 模式

### 数据库迁移

```bash
# 生成新的迁移文件
alembic revision --autogenerate -m "描述变更"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

### 测试 API

使用 FastAPI 自动生成的交互式文档进行测试：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 部署说明

### 生产环境配置

1. 设置 `DEBUG=False`
2. 配置安全的 `SECRET_KEY`
3. 设置正确的数据库连接
4. 配置域名和 SSL 证书

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `.env` 文件中的数据库连接字符串
   - 确认 PostgreSQL 服务正在运行

2. **迁移失败**
   - 检查数据库权限
   - 确认数据库表不存在冲突

3. **JWT 认证失败**
   - 检查 `SECRET_KEY` 配置
   - 确认 token 格式正确

### 日志查看

应用日志输出到控制台，生产环境建议配置日志文件。

## 联系方式

如有问题，请联系开发团队。