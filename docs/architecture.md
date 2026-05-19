# 灵谕 — AI 塔罗牌小程序 软件架构设计文档

> **版本**：v1.0
> **撰写日期**：2026-05-19
> **产品阶段**：MVP（8 周冲刺）
> **适用范围**：V1.0 MVP

---

## 1. 系统架构总览

### 1.1 整体分层架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          客户端层（Client）                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              微信小程序（Taro 3.x + React 18 + TS）            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │
│  │  │  页面层   │ │  组件层   │ │  状态管理  │ │   动画引擎       │ │  │
│  │  │  (Pages)  │ │(Compon.) │ │ (Zustand) │ │(CSS3/Canvas/SVG) │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / WSS (流式)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         网关层（Gateway）                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │   Nginx 反向代理 + SSL 终端 + 负载均衡 + 限流                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         服务层（Service）                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   NestJS Application (Node.js)                │  │
│  │                                                               │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │  Auth   │ │  User   │ │ Divin.  │ │  Order  │            │  │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                        │  │
│  │  │  Card   │ │  Quota  │ │   AI    │                        │  │
│  │  │ Module  │ │ Module  │ │ Module  │                        │  │
│  │  └─────────┘ └─────────┘ └─────────┘                        │  │
│  │                                                               │  │
│  │  Common: Guards / Interceptors / Filters / Pipes / Middleware │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   数据层         │ │   缓存层     │ │   外部服务       │
│                 │ │             │ │                 │
│  MySQL 8.0      │ │  Redis 7.x  │ │  ┌───────────┐ │
│  ┌───────────┐  │ │             │ │  │ 微信开放   │ │
│  │ users     │  │ │ Session     │ │  │ 平台 API  │ │
│  │ records   │  │ │ Quota Cache │ │  └───────────┘ │
│  │ cards     │  │ │ Rate Limit  │ │  ┌───────────┐ │
│  │ orders    │  │ │ Card Cache  │ │  │ 微信支付   │ │
│  │ quotas    │  │ │ AI Cache    │ │  │ API v3   │ │
│  │ ...       │  │ │             │ │  └───────────┘ │
│  └───────────┘  │ │             │ │  ┌───────────┐ │
│                 │ │             │ │  │ Claude    │ │
│  TypeORM        │ │             │ │  │ / GPT API │ │
│                 │ │             │ │  └───────────┘ │
└─────────────────┘ └─────────────┘ └─────────────────┘
```

### 1.2 数据流向概览

```
用户操作 → Taro 前端 → HTTPS → Nginx → NestJS Controller
                                          │
                                          ├→ Service 业务逻辑
                                          │    ├→ TypeORM → MySQL（持久化）
                                          │    ├→ ioredis → Redis（缓存/配额）
                                          │    └→ HTTP → AI API（Claude/GPT）
                                          │
                                          └→ Response → 前端渲染
```

---

## 2. 技术选型详述

### 2.1 前端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **Taro** | 3.6+ | 支持 React 语法编写微信小程序，生态成熟，跨端能力强 |
| **React** | 18.2 | 并发模式支持，Suspense 用于流式加载，Hooks 开发体验好 |
| **TypeScript** | 5.x | 类型安全，团队协作效率高，减少运行时错误 |
| **Zustand** | 4.x | 轻量状态管理，比 Redux 简单，适合小程序场景 |
| **Taro UI** | 3.x | Taro 官方 UI 库，适配小程序组件规范 |
| **dayjs** | 1.x | 轻量日期处理库（2KB），替代 moment.js |

### 2.2 后端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **Node.js** | 20 LTS | 长期支持版本，性能优异，团队熟悉 |
| **NestJS** | 10.x | 企业级 Node.js 框架，模块化架构，内置 DI、装饰器、守卫等 |
| **TypeORM** | 0.3.x | 与 NestJS 深度集成，支持 Migration，TypeScript 原生支持 |
| **class-validator** | 0.14 | 声明式请求参数校验，与 NestJS Pipes 无缝集成 |
| **@nestjs/swagger** | 7.x | 自动生成 API 文档，方便前后端联调 |
| **passport-jwt** | 4.x | JWT 鉴权策略，NestJS 官方推荐方案 |

### 2.3 数据库

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **MySQL** | 8.0 | 成熟稳定的关系型数据库，事务支持完善，JSON 类型支持好 |
| **Redis** | 7.x | 高性能缓存，支持原子操作（配额扣减），支持 TTL（限流） |

### 2.4 AI 服务

| 技术 | 版本/说明 | 选型理由 |
|------|----------|----------|
| **Claude API** | Anthropic Messages API (主力) | 输出质量高，安全性好，Prompt 遵循度强 |
| **GPT API** | OpenAI Chat Completions (备用) | 作为 Claude 不可用时的降级方案 |
| **SSE / WebSocket** | 流式传输 | 支持 AI 解读逐字返回，提升用户体验 |

### 2.5 部署 & DevOps

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| **Docker** | 24.x | 容器化部署，环境一致性 |
| **Docker Compose** | 2.x | 本地开发 & 单机生产编排 |
| **Nginx** | 1.24 | 反向代理、SSL 终端、静态资源服务、限流 |
| **GitHub Actions** | - | CI/CD 流水线，与代码仓库深度集成 |
| **PM2** | 5.x | Node.js 进程管理（容器内使用） |
| **Sentry** | - | 前后端错误监控与告警 |

---

## 3. 模块划分

### 3.1 前端模块结构

```
lingyu-miniapp/
├── config/                    # Taro 编译配置
│   ├── dev.ts
│   ├── prod.ts
│   └── index.ts
├── src/
│   ├── app.tsx                # 应用入口
│   ├── app.config.ts          # 小程序配置（路由、TabBar）
│   ├── app.scss               # 全局样式
│   │
│   ├── core/                  # 核心框架
│   │   ├── router/            # 路由守卫 & 导航工具
│   │   ├── store/             # Zustand 状态管理
│   │   │   ├── userStore.ts       # 用户状态
│   │   │   ├── quotaStore.ts      # 配额状态
│   │   │   └── divinationStore.ts # 占卜流程状态
│   │   ├── http/              # 网络请求封装（拦截器、Token 刷新）
│   │   └── auth/              # 登录 & Token 管理
│   │
│   ├── pages/                 # 页面模块
│   │   ├── splash/            # 启动页
│   │   ├── onboarding/        # 引导页
│   │   ├── agreement/         # 免责协议
│   │   ├── home/              # 首页
│   │   ├── question/          # 问题选择
│   │   ├── spread/            # 牌阵选择
│   │   ├── draw/              # 抽牌（洗牌/选牌/翻牌）
│   │   ├── interpretation/    # AI 解读结果
│   │   ├── cards/             # 牌义列表 & 详情
│   │   ├── packages/          # 付费套餐
│   │   ├── profile/           # 个人中心
│   │   ├── history/           # 历史记录 & 详情
│   │   ├── feedback/          # 意见反馈
│   │   └── about/             # 关于我们
│   │
│   ├── components/            # 公共组件
│   │   ├── CardDeck/          # 牌堆组件（洗牌动画）
│   │   ├── TarotCard/         # 单张塔罗牌（翻牌动画）
│   │   ├── SpreadLayout/      # 牌阵布局组件
│   │   ├── StreamingText/     # 流式文本逐字展示
│   │   ├── QuotaCard/         # 配额卡片
│   │   ├── Disclaimer/        # 免责声明组件
│   │   ├── PaywallModal/      # 付费引导弹窗
│   │   └── Loading/           # 加载状态组件
│   │
│   ├── services/              # API 调用封装
│   │   ├── auth.ts            # 登录相关
│   │   ├── user.ts            # 用户信息
│   │   ├── divination.ts      # 占卜相关
│   │   ├── payment.ts         # 支付相关
│   │   ├── card.ts            # 牌义数据
│   │   └── quota.ts           # 配额查询
│   │
│   ├── utils/                 # 工具函数
│   │   ├── crypto.ts          # 加密工具
│   │   ├── storage.ts         # 本地存储封装
│   │   ├── validator.ts       # 输入校验（敏感词等）
│   │   ├── format.ts          # 格式化工具
│   │   └── animation.ts       # 动画工具函数
│   │
│   ├── constants/             # 常量定义
│   │   ├── routes.ts          # 路由路径
│   │   ├── categories.ts      # 问题分类
│   │   └── config.ts          # 业务配置
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── user.ts
│   │   ├── card.ts
│   │   ├── divination.ts
│   │   └── order.ts
│   │
│   └── assets/                # 静态资源
│       ├── images/            # 图片（牌面、图标、插画）
│       └── styles/            # 全局样式变量 & mixin
│
├── tests/                     # 测试
├── project.config.json        # 微信小程序项目配置
└── package.json
```

### 3.2 后端模块结构

```
lingyu-server/
├── src/
│   ├── main.ts                        # 应用入口
│   ├── app.module.ts                  # 根模块
│   │
│   ├── modules/                       # 业务模块
│   │   ├── auth/                      # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts     # 登录、刷新 Token
│   │   │   ├── auth.service.ts        # 登录逻辑
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts    # JWT 验证策略
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts  # 认证守卫
│   │   │   └── dto/
│   │   │       └── wx-login.dto.ts
│   │   │
│   │   ├── user/                      # 用户模块
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts     # 用户信息 CRUD
│   │   │   ├── user.service.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── divination/               # 占卜模块
│   │   │   ├── divination.module.ts
│   │   │   ├── divination.controller.ts
│   │   │   ├── divination.service.ts  # 抽牌、记录、历史
│   │   │   ├── dto/
│   │   │   │   ├── start.dto.ts
│   │   │   │   └── interpret.dto.ts
│   │   │   └── entities/
│   │   │       └── divination-record.entity.ts
│   │   │
│   │   ├── card/                      # 牌义模块
│   │   │   ├── card.module.ts
│   │   │   ├── card.controller.ts     # 牌义查询
│   │   │   ├── card.service.ts
│   │   │   └── entities/
│   │   │       └── card.entity.ts
│   │   │
│   │   ├── order/                     # 订单模块
│   │   │   ├── order.module.ts
│   │   │   ├── order.controller.ts    # 创建订单、查询状态
│   │   │   ├── order.service.ts
│   │   │   ├── dto/
│   │   │   │   └── create-order.dto.ts
│   │   │   └── entities/
│   │   │       └── order.entity.ts
│   │   │
│   │   ├── payment/                   # 支付模块
│   │   │   ├── payment.module.ts
│   │   │   ├── payment.controller.ts  # 支付回调
│   │   │   ├── payment.service.ts     # 微信支付对接
│   │   │   └── dto/
│   │   │       └── callback.dto.ts
│   │   │
│   │   ├── quota/                     # 配额模块
│   │   │   ├── quota.module.ts
│   │   │   ├── quota.controller.ts
│   │   │   ├── quota.service.ts       # 配额查询、扣减、发放
│   │   │   └── entities/
│   │   │       └── usage-quota.entity.ts
│   │   │
│   │   ├── ai/                        # AI 解读模块
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts          # Prompt 组装、API 调用、后处理
│   │   │   ├── providers/
│   │   │   │   ├── claude.provider.ts # Claude API 适配
│   │   │   │   └── gpt.provider.ts    # GPT API 适配（备用）
│   │   │   ├── prompt/
│   │   │   │   └── tarot.prompt.ts    # Prompt 模板
│   │   │   └── filters/
│   │   │       └── content-filter.ts  # 内容安全过滤
│   │   │
│   │   └── feedback/                  # 反馈模块
│   │       ├── feedback.module.ts
│   │       ├── feedback.controller.ts
│   │       └── feedback.service.ts
│   │
│   ├── common/                        # 公共层
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts   # 请求日志
│   │   │   └── rate-limit.middleware.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts  # 统一响应格式
│   │   │   └── timeout.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # 全局异常处理
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   └── dto/
│   │       └── response.dto.ts        # 统一响应 DTO
│   │
│   ├── config/                        # 配置
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── wx.config.ts               # 微信开放平台配置
│   │   └── ai.config.ts               # AI API 配置
│   │
│   └── database/                      # 数据库
│       ├── migrations/                # Migration 文件
│       └── seeds/                     # 初始数据（78 张牌、套餐）
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── test/                              # 测试
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 4. 核心流程设计

### 4.1 用户登录流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  小程序   │    │  NestJS  │    │  微信API  │    │  MySQL   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ wx.login()    │               │               │
     │──────code────>│               │               │
     │               │               │               │
     │               │ code2Session  │               │
     │               │──────────────>│               │
     │               │<──openid/     │               │
     │               │   session_key │               │
     │               │               │               │
     │               │  查询用户是否存在              │
     │               │──────────────────────────────>│
     │               │<──────────────user/not_found──│
     │               │               │               │
     │               │  [新用户] INSERT user          │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │  生成 JWT（openid + userId）   │
     │               │  生成 refresh_token            │
     │               │               │               │
     │<──{token,     │               │               │
     │  refreshToken,│               │               │
     │  userInfo}────│               │               │
     │               │               │               │
```

**技术实现要点**：

1. **前端**：调用 `wx.login()` 获取临时 code，POST 到 `/api/auth/wx-login`
2. **后端**：用 code 调用微信 `code2Session` 接口获取 openid 和 session_key
3. **用户查找/创建**：根据 openid 查询 MySQL，不存在则创建新用户（同时初始化 usage_quotas 记录）
4. **Token 生成**：使用 `@nestjs/jwt` 签发 JWT（payload: `{ sub: userId, openid }`，有效期 7 天），同时生成 refresh_token 存入 Redis（TTL 30 天）
5. **无感刷新**：前端 HTTP 拦截器检测 401 响应，自动调用 `/api/auth/refresh`，用 refresh_token 换取新 JWT

### 4.2 抽牌流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  小程序   │    │  NestJS  │    │   Redis  │    │  MySQL   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │  1. 检查配额   │               │               │
     │──────────────>│  GET quota    │               │
     │               │──────────────>│               │
     │               │<──remaining───│               │
     │               │               │               │
     │  [有配额]      │  2. 原子扣减配额               │
     │               │  DECR quota   │               │
     │               │──────────────>│               │
     │               │<──new_remain──│               │
     │               │               │               │
     │               │  3. 生成随机牌序               │
     │               │  Fisher-Yates 洗牌算法         │
     │               │  随机正/逆位（50%概率）        │
     │               │               │               │
     │               │  4. 查询牌义数据               │
     │               │──────────────────────────────>│
     │               │<──────cards[]────────────────│
     │               │               │               │
     │  5. 返回选牌结果（仅返回牌背面信息）           │
     │<──{sessionId, │               │               │
     │   cardCount}──│               │               │
     │               │               │               │
     │  [用户完成选牌和翻牌]                          │
     │               │               │               │
     │  6. 请求 AI 解读                               │
     │──────────────>│               │               │
     │               │  组装 Prompt   │               │
     │               │  调用 AI API（SSE 流式）       │
     │  7. 流式返回 ──│<═════════════│               │
     │<═══SSE════════│               │               │
     │               │               │               │
     │               │  8. 保存记录                    │
     │               │──────────────────────────────>│
     │               │               │               │
```

**技术实现要点**：

1. **配额检查**：优先消耗免费次数（`free_single_remaining` / `free_three_remaining`），免费次数为 0 时消耗付费次数
2. **原子扣减**：使用 Redis `DECRBY` 原子操作扣减配额，避免并发超扣。同时在 MySQL 中持久化，Redis 作为热缓存
3. **随机算法**：使用 Fisher-Yates 洗牌算法生成 1-78 的随机序列；正/逆位使用 `crypto.randomInt(2)` 生成
4. **Session 管理**：抽牌结果暂存 Redis（TTL 30 分钟），防止前端篡改牌面数据
5. **流式返回**：AI 解读通过 SSE（Server-Sent Events）流式返回，前端逐字渲染

### 4.3 支付流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  小程序   │    │  NestJS  │    │ 微信支付  │    │  MySQL   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │  1. 选择套餐   │               │               │
     │──────────────>│               │               │
     │               │  创建订单（status: pending）    │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │  2. 统一下单（JSAPI）          │
     │               │──────────────────────────────>│
     │               │<──────prepay_id──────────────│
     │               │               │               │
     │  3. 返回支付参数               │               │
     │<──{timeStamp, │               │               │
     │   nonceStr,   │               │               │
     │   package,    │               │               │
     │   signType,   │               │               │
     │   paySign}────│               │               │
     │               │               │               │
     │  4. wx.requestPayment()       │               │
     │──────────────────────────────>│               │
     │<──────────────支付结果────────│               │
     │               │               │               │
     │               │  5. 异步回调（/payment/callback）│
     │               │<──────────────webhook────────│
     │               │               │               │
     │               │  验签 → 更新订单状态          │
     │               │  发放配额 → 更新 usage_quotas │
     │               │──────────────────────────────>│
     │               │               │               │
     │  6. 前端轮询订单状态          │               │
     │──────────────>│               │               │
     │<──{status:    │               │               │
     │   "paid",     │               │               │
     │   quota_added}│               │               │
     │               │               │               │
```

**技术实现要点**：

1. **幂等控制**：订单号由后端生成（UUID），同一订单号的回调只处理一次（`status = pending` 时才更新）
2. **双重保障**：支付回调 + 前端轮询 + 定时任务（每 5 分钟扫描 pending 超过 5 分钟的订单，主动查询微信支付状态）
3. **配额发放**：在回调中使用数据库事务（`START TRANSACTION`），确保订单状态更新和配额增加的原子性
4. **金额校验**：回调中验证 `total_amount` 与订单金额一致，防止篡改

### 4.4 AI 解读流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  小程序   │    │  NestJS  │    │   Redis  │    │ Claude   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │  interpret    │               │               │
     │  {question,   │               │               │
     │   cards,      │               │               │
     │   spread_type}│               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │  1. 检查缓存   │               │
     │               │──────────────>│               │
     │               │<──miss────────│               │
     │               │               │               │
     │               │  2. 组装 Prompt               │
     │               │  (system + user + context)    │
     │               │               │               │
     │               │  3. 调用 Claude API（流式）    │
     │               │──────────────────────────────>│
     │<══SSE═════════│<═════stream chunks═══════════│
     │  逐字渲染      │               │               │
     │               │               │               │
     │               │  4. 内容安全过滤               │
     │               │  (敏感词替换 + 免责追加)       │
     │               │               │               │
     │               │  5. 写入缓存   │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │  6. 保存到 divination_records  │
     │               │──────────────────────────────>│
     │               │               │               │
```

**技术实现要点**：

1. **Prompt 模板**：使用分层 Prompt 结构——System Prompt 定义角色和规则，User Prompt 注入用户问题和牌面信息
2. **流式传输**：使用 SSE（Server-Sent Events）实现流式输出。前端通过 `EventSource` 或 `fetch + ReadableStream` 接收
3. **内容安全**：后端对 AI 返回内容进行敏感词过滤（正则 + 词库匹配），违规内容替换为兜底话术，尾部追加免责声明
4. **缓存策略**：相同问题 + 相同牌面的解读结果缓存到 Redis（TTL 24 小时），减少 API 调用成本
5. **降级方案**：Claude API 超时（>15s）或不可用时，自动切换到 GPT API；两个 API 均不可用时返回预设兜底解读
6. **重试机制**：使用 exponential backoff 策略，最多重试 2 次

---

## 5. 安全架构

### 5.1 接口鉴权

```
请求 → Nginx → NestJS Middleware → Guard → Controller
                                           │
                     JWT Auth Guard ───────┘
                     ├─ 验证 Token 签名
                     ├─ 验证 Token 过期时间
                     ├─ 解析 userId & openid
                     └─ 注入到 Request.user
```

- **Token 格式**：JWT，payload 包含 `{ sub: userId, openid: string, iat, exp }`
- **有效期**：Access Token 7 天，Refresh Token 30 天
- **无感刷新**：前端 HTTP 拦截器在收到 401 时自动调用 refresh 接口
- **Token 吊销**：支持将 userId 加入 Redis 黑名单（用于账号注销等场景）

### 5.2 请求频率限制

| 接口类型 | 限制策略 | 说明 |
|----------|----------|------|
| 登录接口 | 10 次/分钟/IP | 防暴力刷登录 |
| 抽牌接口 | 5 次/分钟/用户 | 防刷配额 |
| AI 解读 | 3 次/分钟/用户 | 控制 API 成本 |
| 支付接口 | 10 次/分钟/用户 | 防重复下单 |
| 通用接口 | 60 次/分钟/用户 | 基础防护 |

**实现方式**：Redis + 滑动窗口算法。NestJS 自定义 Middleware，key 格式 `ratelimit:{接口}:{用户ID}:{时间窗口}`。

### 5.3 数据加密策略

| 数据 | 加密方式 | 说明 |
|------|----------|------|
| JWT Token | RS256 签名 | 防篡改 |
| 微信 session_key | AES-256 加密存储到 MySQL | 敏感凭证 |
| 支付回调报文 | 微信支付 V3 AEAD 解密 | 官方标准 |
| 传输层 | HTTPS (TLS 1.2+) | 全链路加密 |

### 5.4 API 安全防护

| 威胁 | 防护措施 |
|------|----------|
| **SQL 注入** | TypeORM 参数化查询（默认），禁止原生 SQL 拼接 |
| **XSS** | 前端输出转义（React 默认转义），后端对用户输入做 sanitize |
| **CSRF** | 小程序天然无 CSRF（不使用 Cookie），JWT 放在 Authorization Header |
| **重放攻击** | 请求携带 timestamp + nonce，服务端校验时间窗口（5 分钟内） |
| **越权访问** | JWT 中的 userId 与资源的 userId 校验（Guard + Service 双重校验） |
| **敏感词注入** | 用户输入经过敏感词过滤（问题输入框） |

---

## 6. 缓存策略

### 6.1 Redis 缓存数据分类

| 数据 | Key 格式 | 类型 | TTL | 说明 |
|------|----------|------|-----|------|
| 用户 Session | `session:{userId}` | Hash | 7d | JWT 相关信息 |
| Refresh Token | `refresh:{userId}` | String | 30d | 用于无感刷新 |
| 用户配额 | `quota:{userId}` | Hash | 无过期 | 热缓存，与 MySQL 同步 |
| 牌义数据 | `cards:all` | String (JSON) | 24h | 78 张牌义全量缓存 |
| 单张牌义 | `card:{cardId}` | String (JSON) | 24h | 单张牌义缓存 |
| 抽牌 Session | `draw:{sessionId}` | String (JSON) | 30min | 临时抽牌结果 |
| AI 解读缓存 | `ai:cache:{hash}` | String | 24h | 相同输入的解读缓存 |
| 限流计数 | `ratelimit:{api}:{userId}:{window}` | String | 滑动窗口 | 接口频率限制 |
| Token 黑名单 | `blacklist:{tokenId}` | String | 剩余有效期 | Token 吊销 |

### 6.2 Key 命名规范

```
{模块}:{资源}:{标识}[:{子资源}]

示例：
quota:user123              → 用户配额
session:user123            → 用户 Session
card:major_00              → 单张牌义
cards:all                  → 全量牌义
draw:abc-123-def           → 抽牌 Session
ai:cache:a1b2c3d4          → AI 解读缓存
ratelimit:divination:user123:1716096000 → 限流
```

### 6.3 缓存更新策略

| 场景 | 策略 | 说明 |
|------|------|------|
| 牌义数据 | Cache-Aside + 手动失效 | 数据变更时主动清除缓存 |
| 用户配额 | Write-Through | 扣减/发放时同时更新 Redis 和 MySQL |
| AI 解读 | Cache-Aside + TTL | 相同输入 24 小时内命中缓存 |
| 抽牌 Session | 仅缓存 | 临时数据，过期自动清理 |
| Token | 创建时写入，校验时读取 | 签发时存 Redis，验证时查 Redis |

---

## 7. 部署架构

### 7.1 Docker 编排

```yaml
# docker-compose.yml 概要
services:
  nginx:           # 反向代理 + SSL
    ports: [80, 443]

  app:             # NestJS 应用
    replicas: 2    # 生产环境 2 副本
    env: [NODE_ENV=production]

  mysql:           # MySQL 8.0
    volumes: [mysql-data:/var/lib/mysql]

  redis:           # Redis 7.x
    volumes: [redis-data:/data]
```

### 7.2 环境划分

| 环境 | 用途 | 域名 | 配置 |
|------|------|------|------|
| **dev** | 本地开发 | localhost:3000 | Docker Compose 本地起全套 |
| **staging** | 预发布测试 | staging.lingyu.com | 单台云服务器，共享测试数据库 |
| **prod** | 生产环境 | api.lingyu.com | 2 台云服务器 + SLB，独立数据库 |

### 7.3 CI/CD 流程

```
代码提交 → GitHub Push
    │
    ▼
GitHub Actions 触发
    │
    ├── 1. Lint + TypeScript 类型检查
    │
    ├── 2. 单元测试（Jest）
    │
    ├── 3. 构建 Docker 镜像
    │     └── docker build -t lingyu-server:${GIT_SHA}
    │
    ├── 4. 推送镜像到镜像仓库（阿里云 ACR / 腾讯云 TCR）
    │
    └── 5. 部署到目标环境
          ├── staging: 自动部署（main 分支 push）
          └── prod: 手动触发（打 tag v*）
                └── SSH 到服务器 → docker pull → docker-compose up -d
```

### 7.4 监控告警

| 监控维度 | 工具 | 告警规则 |
|----------|------|----------|
| 应用错误 | Sentry | 每小时错误数 > 10 触发告警 |
| API 响应时间 | Prometheus + Grafana | P95 > 1s 告警 |
| 服务器资源 | Node Exporter | CPU > 80% 或 内存 > 85% 告警 |
| 数据库 | MySQL Exporter | 慢查询 > 1s/连接数 > 80% 告警 |
| Redis | Redis Exporter | 内存 > 80% 告警 |
| AI API | 自定义埋点 | 失败率 > 5% 告警 |
| 微信支付回调 | 日志 + 告警 | 回调失败立即告警 |

---

## 8. 关键设计决策

### 8.1 为什么选 Taro 而不是原生小程序

- React 生态成熟，组件复用率高
- TypeScript 支持更好，类型安全
- 未来可扩展到 H5/App
- 团队熟悉 React，开发效率高

### 8.2 为什么选 NestJS 而不是 Express/Koa

- 模块化架构，适合多人协作
- 内置 DI 容器，可测试性好
- 装饰器 + TypeScript 原生支持
- 内置 Guard、Interceptor、Pipe 等，减少重复造轮子

### 8.3 为什么 AI 用 Claude 为主、GPT 为辅

- Claude 的 Prompt 遵循度更强，适合结构化输出（塔罗解读格式要求严格）
- Claude 的安全对齐更好，减少违规内容风险
- GPT 作为降级方案，确保服务可用性

### 8.4 为什么配额用 Redis + MySQL 双写

- Redis 原子操作（DECRBY）保证并发安全
- Redis 作为热缓存降低 MySQL 压力
- MySQL 作为持久化，Redis 宕机时可从 MySQL 恢复
- 定时对账任务确保数据一致性

---

## 附录：技术栈版本清单

| 组件 | 版本 |
|------|------|
| Node.js | 20 LTS |
| NestJS | 10.x |
| TypeORM | 0.3.x |
| MySQL | 8.0 |
| Redis | 7.x |
| Taro | 3.6+ |
| React | 18.2 |
| TypeScript | 5.x |
| Docker | 24.x |
| Nginx | 1.24 |
