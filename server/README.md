# 灵谕 — AI 塔罗牌小程序后端服务

## 技术栈

- NestJS 10.x + TypeScript 5.x
- TypeORM 0.3.x + MySQL 8.0
- ioredis + Redis 7.x
- Swagger API 文档
- Docker + Docker Compose

## 快速启动

### 1. 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动 MySQL + Redis（使用 Docker）
docker-compose up -d mysql redis

# 运行数据库迁移
npm run migration:run

# 启动开发服务器
npm run start:dev
```

### 2. Docker 全量启动

```bash
docker-compose up -d
```

### 3. API 文档

启动后访问：http://localhost:3000/api/docs

## 项目结构

```
src/
├── main.ts                  # 应用入口
├── app.module.ts            # 根模块
├── modules/                 # 业务模块
│   ├── auth/                # 微信登录 + JWT 鉴权
│   ├── user/                # 用户管理
│   ├── divination/          # 占卜核心
│   ├── card/                # 牌义数据
│   ├── order/               # 订单 & 支付
│   ├── quota/               # 使用配额
│   └── ai/                  # AI 解读
├── common/                  # 公共层
├── config/                  # 配置模块
└── database/                # 数据库 & 种子数据
```

## 常用命令

```bash
npm run start:dev        # 开发模式（热重载）
npm run build            # 构建
npm run start:prod       # 生产模式启动
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm test                 # 单元测试
npm run migration:run    # 运行迁移
npm run migration:revert # 回滚迁移
```
