# 灵谕 — AI 塔罗牌小程序

以严谨的占星逻辑为内核，以 AI 大模型为效率工具，以高审美的视觉交互为外壳，为用户提供缓解现实焦虑、提供情绪价值的数字占卜体验。

> 产品定位：打娱乐牌、走心理路、做情绪价值

## 技术架构

```
┌─────────────────────────────────────────────────┐
│                  微信小程序 (Taro)                │
│  React 18 + TypeScript + Zustand + SCSS         │
├──────────┬──────────┬───────────┬───────────────┤
│  17 页面  │  9 组件   │  4 Store  │   6 Service   │
└──────────┴────┬─────┴───────────┴───────────────┘
                │ HTTPS (JWT Auth)
┌───────────────▼─────────────────────────────────┐
│              后端 API (NestJS 10)                │
│  TypeORM + Passport JWT + class-validator       │
├─────────┬────────┬────────┬────────┬────────────┤
│  auth   │  card  │  divi- │ quota  │   order    │
│  用户认证 │  牌义   │  占卜   │  配额   │   支付     │
├─────────┴────────┴────────┴────────┴────────────┤
│  ai (Claude/GPT API)                            │
│  Prompt 模板 → LLM 调用 → 安全过滤 → 存储        │
└─────────┬───────────────────────┬───────────────┘
          │                      │
    ┌─────▼─────┐         ┌─────▼─────┐
    │   MySQL   │         │   Redis   │
    │   8.0     │         │   7       │
    └───────────┘         └───────────┘
```

### 技术选型

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Taro + React | 3.6 / 18 |
| 状态管理 | Zustand | 4.x |
| 样式 | SCSS | - |
| 后端框架 | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7 |
| 认证 | JWT (Passport) | - |
| AI | Claude / GPT API | - |
| 部署 | Docker + PM2 | - |
| CI/CD | GitHub Actions | - |

## 项目结构

```
divination/
├── client/                    # 微信小程序前端
│   └── src/
│       ├── pages/             # 17 个页面
│       │   ├── home/              # 首页
│       │   ├── question-select/   # 问题选择
│       │   ├── spread-select/     # 牌阵选择
│       │   ├── shuffle/           # 洗牌动画
│       │   ├── pick-card/         # 选牌交互
│       │   ├── reveal/            # 翻牌揭晓
│       │   ├── result-single/     # 单牌结果
│       │   ├── result-three/      # 三牌阵结果
│       │   ├── history-list/      # 历史记录
│       │   ├── history-detail/    # 记录详情
│       │   ├── profile/           # 个人中心
│       │   ├── packages/          # 付费套餐
│       │   └── ...
│       ├── components/        # 9 个组件
│       │   ├── TarotCard/         # 塔罗牌 3D 翻转
│       │   ├── ShuffleDeck/       # 洗牌动画
│       │   ├── CardSpread/        # 牌阵布局
│       │   ├── StarBackground/    # 星空粒子背景
│       │   ├── AiLoading/         # AI 解读加载态
│       │   ├── DisclaimerModal/   # 免责声明弹窗
│       │   ├── PayWallModal/      # 付费墙弹窗
│       │   ├── QuotaBadge/        # 配额徽章
│       │   └── CategoryTag/       # 分类标签
│       ├── store/             # 4 个 Zustand Store
│       ├── services/          # 6 个 API 服务
│       └── utils/
│
├── server/                    # 后端 API
│   └── src/
│       ├── modules/
│       │   ├── auth/              # 微信登录 + JWT + 免责协议
│       │   ├── user/              # 用户信息
│       │   ├── card/              # 78 张牌义 + 牌阵定义
│       │   ├── divination/        # 抽牌 + 占卜记录
│       │   ├── quota/             # 配额管理（免费+付费）
│       │   ├── order/             # 订单 + 支付
│       │   └── ai/                # AI 解读（开发中）
│       ├── common/            # 拦截器 / 过滤器 / 守卫 / 装饰器
│       └── database/          # 数据源 + 种子数据
│
├── docs/                      # 设计文档
│   ├── market-research.md     # 市场调研
│   ├── PRD.md                 # 产品需求
│   ├── prototype.md           # 原型图
│   ├── architecture.md        # 架构设计
│   ├── database.md            # 数据库设计
│   ├── ui-design-spec.md      # UI/UX 规范
│   └── DEVLOG.md              # 开发日志
│
└── .github/workflows/         # CI/CD
    ├── ci.yml                     # Lint + Test + Build
    └── deploy.yml                 # Docker 构建 + 部署
```

## 已完成功能

### Sprint 2.1 — 用户登录 ✅
- 微信一键登录（code → openid → JWT）
- 开发环境 mock 降级（无 appId/secret 时自动 mock）
- token 持久化 + 自动刷新
- 首次使用免责协议弹窗（IP/UA 记录）

### Sprint 2.2 — 问题选择 ✅
- 5 类问题选择（爱情/事业/财运/健康/综合）+ 高亮选中态
- 自定义问题输入（100 字校验 + 预设问题推荐）
- 牌阵选择（单牌/三牌阵）+ 剩余次数展示 + 配额联动

### Sprint 2.3 — 抽牌核心交互 ✅
- 洗牌动画组件（手势滑动进度条 + CSS 卡牌交错）
- 选牌交互（牌堆点击 → 逐张揭露真实牌面）
- 翻牌动画（3D rotateY 翻转 + 正逆位标识）
- 后端 Fisher-Yates 洗牌算法 + 随机正逆位
- 配额扣减（免费优先 → 付费 → 不足抛 402）

### Sprint 2.4 — 牌义展示 ✅
- 后端格式化牌义接口（按正逆位返回对应关键词和含义）
- 单牌/三牌结果页展示完整牌义 + 关键词

### 基础设施 ✅
- GitHub Actions CI（PR/push 自动 lint + type-check + build）
- GitHub Actions Deploy（master 合并 → Docker 构建 → 服务器部署）
- Docker 多阶段构建 + PM2 集群模式

## 快速开始

### 前置条件

- Node.js >= 18
- Docker + Docker Compose
- 微信开发者工具

### 后端启动

```bash
cd server

# 启动 MySQL + Redis
docker compose up -d mysql redis

# 安装依赖 + 启动
npm install
npm run start:dev
```

### 前端启动

```bash
cd client

npm install
npm run dev:weapp
```

用微信开发者工具打开 `client/dist` 目录预览。

## 核心流程

```
首页 → 免责协议确认
  → 问题选择（5 类别 + 自定义）
    → 牌阵选择（单牌 / 三牌阵）
      → 洗牌动画
        → 选牌（后端 Fisher-Yates + 随机正逆位）
          → 翻牌揭晓（3D 动画）
            → 牌义展示 + AI 解读（开发中）
              → 保存历史
```

## 文档

| 文档 | 说明 |
|------|------|
| [市场调研](docs/market-research.md) | 6 家竞品分析、市场规模、用户画像 |
| [PRD](docs/PRD.md) | 23 条用户故事、10 个功能模块验收标准 |
| [原型图](docs/prototype.md) | 18 个页面线框图、交互流程 |
| [架构设计](docs/architecture.md) | 分层架构、安全设计、部署方案 |
| [数据库设计](docs/database.md) | 10 张表 E-R 图、78 张牌种子数据 |
| [UI/UX 规范](docs/ui-design-spec.md) | 色彩/字体/组件/动效规范 |
| [开发日志](docs/DEVLOG.md) | 每个需求点的完成记录 |
