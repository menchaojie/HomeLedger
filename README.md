# HomeLedger - 家庭账本管理系统

HomeLedger 是一个基于微信小程序的家庭账本管理系统，旨在帮助家庭成员管理日常开支、奖励机制和任务分配。

## 项目结构

```
HomeLedger/
├── Backend/               # FastAPI 后端
│   ├── app/              # 应用主目录
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心配置
│   │   ├── models/       # 数据模型
│   │   ├── schemas/      # Pydantic 模式
│   │   └── main.py       # 应用入口
│   ├── migrations/       # 数据库迁移
│   ├── .env              # 环境变量配置
│   ├── alembic.ini       # Alembic 配置
│   └── requirements.txt  # 项目依赖
├── WeApp/                 # 微信小程序前端
│   ├── pages/            # 页面文件
│   │   ├── family/       # 家庭页面
│   │   ├── transaction/  # 交易页面
│   │   ├── profile/      # 个人页面
│   │   └── test/         # 测试页面
│   ├── assets/           # 静态资源
│   ├── app.json          # 小程序配置文件
│   ├── app.js            # 小程序入口文件
│   └── package.json      # 项目依赖
├── README.md             # 项目说明文档
├── .gitignore            # Git忽略文件
└── git_push.sh           # Git 推送脚本
```

## 微信小程序前端 (WeApp)

### 功能模块

#### 1. 家庭页面 (FamilyPage)
- **家庭信息展示**: 显示家庭名称、ID、成员数、创建时间
- **成员管理**: 展示家庭成员列表，包括头像、姓名、余额和角色
- **家庭操作**: 
  - 创建家庭
  - 加入家庭
  - 管理员功能：设置每月额度、成员审批、奖励审批

#### 2. 交易页面 (TransactionPage)
- **服务区**: 展示可购买的服务，支持购买操作
- **悬赏任务区**: 展示悬赏任务，支持发布任务
- **交易记录区**: 显示所有交易记录，支持筛选和详情查看

#### 3. 个人页面 (ProfilePage)
- **个人信息**: 显示用户头像、昵称、留言
- **余额管理**: 展示个人余额和余额变动记录
- **奖励申请**: 提交奖励申请，管理员可审批
- **设置功能**: 修改昵称、头像、通知设置、系统设置
- **登录退出**: 微信登录和退出登录功能

### 技术栈

- **框架**: 微信小程序原生开发
- **UI组件库**: Vant Weapp
- **样式**: WXSS (微信样式语言)
- **状态管理**: 微信小程序原生数据绑定
- **图标**: 自定义生成的图标文件

### 开发环境

- 微信开发者工具
- Node.js (用于包管理)
- Vant Weapp 组件库

### 页面设计

- **主色调**: #4CAF50 (绿色)
- **字体**: PingFang SC
- **布局**: 响应式设计，适配不同屏幕尺寸
- **交互**: 底部 TabBar 导航，页面切换平滑

## 后端实现 (已完成)

后端使用 FastAPI 框架开发，数据库使用 PostgreSQL，包含以下功能：
- 用户认证和授权 (JWT)
- 家庭管理 API
- 交易记录 API
- 任务管理 API
- 奖励系统 API
- 服务管理 API

### 后端技术栈

- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **数据库迁移**: Alembic
- **数据验证**: Pydantic
- **认证**: JWT
- **密码加密**: passlib[bcrypt]

### 后端 API 接口设计

#### 1. 用户认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/me` - 更新用户信息

#### 2. 家庭管理
- `GET /api/families` - 获取家庭列表
- `POST /api/families` - 创建家庭
- `GET /api/families/{family_id}` - 获取家庭详情
- `PUT /api/families/{family_id}` - 更新家庭信息
- `DELETE /api/families/{family_id}` - 删除家庭
- `POST /api/families/{family_id}/join` - 加入家庭
- `GET /api/families/{family_id}/members` - 获取家庭成员列表
- `PUT /api/families/{family_id}/members/{member_id}` - 更新成员角色
- `DELETE /api/families/{family_id}/members/{member_id}` - 移除家庭成员

#### 3. 交易管理
- `GET /api/transactions` - 获取交易记录
- `POST /api/transactions` - 创建交易记录
- `GET /api/transactions/{transaction_id}` - 获取交易详情
- `PUT /api/transactions/{transaction_id}` - 更新交易记录
- `DELETE /api/transactions/{transaction_id}` - 删除交易记录

#### 4. 任务管理
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/{task_id}` - 获取任务详情
- `PUT /api/tasks/{task_id}` - 更新任务状态
- `DELETE /api/tasks/{task_id}` - 删除任务

#### 5. 奖励管理
- `GET /api/rewards` - 获取奖励列表
- `POST /api/rewards` - 创建奖励申请
- `GET /api/rewards/{reward_id}` - 获取奖励详情
- `PUT /api/rewards/{reward_id}` - 更新奖励状态
- `DELETE /api/rewards/{reward_id}` - 删除奖励申请

#### 6. 服务管理
- `GET /api/services` - 获取服务列表
- `POST /api/services` - 创建服务
- `GET /api/services/{service_id}` - 获取服务详情
- `PUT /api/services/{service_id}` - 更新服务信息
- `DELETE /api/services/{service_id}` - 删除服务

### 数据模型

- **User** - 用户信息
- **Family** - 家庭信息
- **FamilyMember** - 家庭成员关系
- **TransactionEvent** - 交易记录
- **MemberBalanceSnapshot** - 成员余额快照
- **Service** - 服务信息
- **BountyTask** - 悬赏任务
- **Reward** - 奖励申请

### 后端 API 接口设计

#### 1. 用户认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息

#### 2. 家庭管理
- `GET /api/families` - 获取家庭列表
- `POST /api/families` - 创建家庭
- `GET /api/families/{family_id}` - 获取家庭详情
- `PUT /api/families/{family_id}` - 更新家庭信息
- `DELETE /api/families/{family_id}` - 删除家庭
- `POST /api/families/{family_id}/join` - 加入家庭
- `GET /api/families/{family_id}/members` - 获取家庭成员列表
- `POST /api/families/{family_id}/members` - 添加家庭成员
- `DELETE /api/families/{family_id}/members/{member_id}` - 移除家庭成员

#### 3. 交易管理
- `GET /api/transactions` - 获取交易记录
- `POST /api/transactions` - 创建交易记录
- `GET /api/transactions/{transaction_id}` - 获取交易详情
- `PUT /api/transactions/{transaction_id}` - 更新交易记录
- `DELETE /api/transactions/{transaction_id}` - 删除交易记录

#### 4. 任务管理
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/{task_id}` - 获取任务详情
- `PUT /api/tasks/{task_id}` - 更新任务状态
- `DELETE /api/tasks/{task_id}` - 删除任务

#### 5. 奖励管理
- `GET /api/rewards` - 获取奖励列表
- `POST /api/rewards` - 创建奖励申请
- `GET /api/rewards/{reward_id}` - 获取奖励详情
- `PUT /api/rewards/{reward_id}` - 更新奖励状态
- `DELETE /api/rewards/{reward_id}` - 删除奖励申请

#### 6. 服务管理
- `GET /api/services` - 获取服务列表
- `POST /api/services` - 创建服务
- `GET /api/services/{service_id}` - 获取服务详情
- `PUT /api/services/{service_id}` - 更新服务信息
- `DELETE /api/services/{service_id}` - 删除服务

### 数据模型

- **User** - 用户信息
- **Family** - 家庭信息
- **Member** - 家庭成员关系
- **Transaction** - 交易记录
- **Task** - 任务信息
- **Reward** - 奖励申请
- **Service** - 服务信息

## Git 操作命令

### 初始化 Git 仓库
```bash
cd /Users/moon/Code/HomeLedger
git init
git add .
git commit -m "Initial commit: 微信小程序前端基础框架"
```

### 添加远程仓库
```bash
git remote add origin <远程仓库地址>
git branch -M main
git push -u origin main
```

### 日常开发流程
```bash
# 创建新分支
git checkout -b feature/新功能名称

# 开发完成后提交
git add .
git commit -m "feat: 添加新功能描述"

# 推送到远程
git push origin feature/新功能名称

# 合并到主分支
git checkout main
git merge feature/新功能名称
git push origin main
```

### 查看状态和日志
```bash
git status
git log --oneline
git branch -a
```

## 开发进度

- ✅ 微信小程序前端基础框架搭建
- ✅ 三个主要页面（家庭、交易、个人）开发完成
- ✅ Vant Weapp 组件库集成
- ✅ 底部导航栏配置
- ✅ 后端 API 开发
- ✅ 数据库设计
- ❌ 前后端联调

## 文档链接

### 后端文档
- [后端使用说明](Backend/README.md) - 后端 API 使用指南和开发说明
- [数据库管理说明](Backend/DATABASE.md) - 数据库初始化、迁移和管理指南

### 前端文档
- [微信小程序前端开发文档](WeApp/HomeLedge微信小程序前端开发文档.md) - 前端开发详细说明

## 注意事项

1. 前端目前使用模拟数据，需要等待后端 API 开发完成后进行联调
2. 图标文件已生成，但需要确保路径正确
3. 微信小程序需要配置合法的域名才能正常访问后端 API
4. 建议在开发前配置好微信开发者工具和小程序 AppID