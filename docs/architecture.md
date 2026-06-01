# 灵谕 — 软件架构设计文档

> **版本**：v2.0（云开发架构）
> **更新日期**：2026-05-29
> **架构变更**：从 NestJS + MySQL 迁移至微信云开发

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────┐
│               微信小程序 (Taro 3.6)              │
│      React 18 + TypeScript + Zustand + SCSS     │
├──────────┬──────────┬───────────┬───────────────┤
│  17 页面  │  9 组件   │  5 Store  │   7 Service   │
├──────────┴──────────┴───────────┴───────────────┤
│             微信云开发 (CloudBase)                │
│       云函数 (Node.js 18) + 云数据库 (JSON)      │
├────────┬────────┬─────────┬────────┬────────────┤
│ login  │  card  │ divi-   │ quota  │   order    │
│ 用户认证│  牌义   │ nation  │  配额   │   支付     │
│        │        │  占卜    │        │            │
├────────┴────────┴─────────┴────────┴────────────┤
│              ai-interpret (AI 解读)              │
│    Prompt 模板 → Claude/GPT → 安全过滤 → 存储    │
└─────────────────────────────────────────────────┘
```

### 数据流

```
Taro 前端
  → wx.cloud.callFunction()
    → 云函数（业务逻辑）
      → 云数据库（读写）
      → Claude/GPT API（AI 解读）
      → 微信支付 API（下单）
```

---

## 2. 技术选型

### 2.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Taro | 3.6.35 | 跨端框架（微信小程序） |
| React | 18.2 | UI 框架 |
| Zustand | 4.x | 状态管理 |
| SCSS | - | 样式方案 |
| TypeScript | 5.4 | 类型安全 |

### 2.2 后端（微信云开发）

| 技术 | 用途 |
|------|------|
| 云函数 (Node.js 18) | 业务逻辑 |
| 云数据库 (JSON) | 数据存储 |
| wx-server-sdk | 微信 API 调用 |

### 2.3 外部服务

| 服务 | 用途 |
|------|------|
| Claude Messages API | AI 解读（主） |
| GPT API | AI 解读（降级） |
| 微信支付 API | 支付统一下单 |

### 2.4 工程化

| 工具 | 用途 |
|------|------|
| GitHub Actions | CI（PR 触发 lint + type-check + build） |
| ESLint | 代码规范 |
| Prettier | 代码格式化 |

---

## 3. 项目结构

```
divination/
├── client/                        # 微信小程序前端（Taro）
│   └── src/
│       ├── pages/                 # 17 个页面
│       │   ├── home/                  # 首页
│       │   ├── question-select/       # 问题选择
│       │   ├── spread-select/         # 牌阵选择
│       │   ├── shuffle/               # 洗牌动画
│       │   ├── pick-card/             # 选牌交互
│       │   ├── reveal/                # 翻牌揭晓
│       │   ├── result-single/         # 单牌结果+AI解读
│       │   ├── result-three/          # 三牌阵结果+AI解读
│       │   ├── history-list/          # 历史记录列表
│       │   ├── history-detail/        # 历史记录详情
│       │   ├── profile/               # 个人中心
│       │   ├── packages/              # 付费套餐
│       │   ├── payment-result/        # 支付结果
│       │   ├── settings/              # 设置/关于我们
│       │   ├── onboarding/            # 引导页
│       │   ├── loading/               # 加载页
│       │   └── error/                 # 错误页
│       │
│       ├── components/            # 9 个通用组件
│       │   ├── TarotCard/             # 塔罗牌（3D翻转+正逆位）
│       │   ├── ShuffleDeck/           # 洗牌动画（手势+进度条）
│       │   ├── CardSpread/            # 牌阵布局
│       │   ├── StarBackground/        # 星空粒子背景
│       │   ├── AiLoading/             # AI解读加载（星形旋转+诗句轮播）
│       │   ├── TypewriterText/        # 打字机效果（逐字输出+光标闪烁）
│       │   ├── DisclaimerModal/       # 免责声明弹窗
│       │   ├── PayWallModal/          # 付费墙弹窗
│       │   ├── QuotaBadge/            # 配额徽章
│       │   └── CategoryTag/           # 分类标签
│       │
│       ├── store/                 # 5 个 Zustand Store
│       │   ├── userStore.ts           # 用户信息+登录态
│       │   ├── divinationStore.ts     # 占卜流程状态
│       │   ├── quotaStore.ts          # 配额状态
│       │   ├── uiStore.ts             # UI 全局状态
│       │   └── index.ts               # 统一导出
│       │
│       ├── services/              # 7 个服务层
│       │   ├── cloud.ts               # 云开发基础封装
│       │   ├── auth.ts                # 登录+协议+注销
│       │   ├── card.ts                # 牌义查询
│       │   ├── divination.ts          # 抽牌+AI解读+历史
│       │   ├── quota.ts               # 配额查询
│       │   └── order.ts               # 订单+支付
│       │
│       ├── styles/                # 全局样式
│       │   ├── variables.scss         # 色彩/字体/间距变量
│       │   ├── mixins.scss            # 布局/按钮/卡片 Mixin
│       │   ├── animation.scss         # 关键帧动画
│       │   └── reset.scss             # 样式重置
│       │
│       ├── utils/                 # 工具函数
│       │   ├── constants.ts           # 路由/分类/预设问题常量
│       │   └── performance.ts         # 设备性能检测+动画降级
│       │
│       └── assets/                # 静态资源
│           ├── images/
│           │   ├── cards/             # 78 张牌面 SVG
│           │   ├── icons/             # TabBar 图标（PNG+SVG）
│           │   ├── brand/             # Logo、星形符号
│           │   ├── onboarding/        # 引导页插画
│           │   ├── empty/             # 空状态插画
│           │   └── error/             # 错误状态插画
│           ├── fonts/
│           └── lottie/
│
├── cloud/                         # 微信云开发后端
│   ├── functions/                 # 6 个云函数
│   │   ├── login/                     # 微信登录+注销账号
│   │   ├── card/                      # 牌义查询（78张牌）
│   │   ├── divination/                # 抽牌+占卜记录
│   │   ├── ai-interpret/              # AI 解读（Claude/GPT+缓存+安全过滤）
│   │   ├── quota/                     # 配额管理（原子扣减+每日重置）
│   │   └── order/                     # 订单+微信支付
│   └── database/
│       └── cards.json                 # 78 张牌种子数据
│
├── docs/                          # 设计文档
└── .github/workflows/
    └── ci.yml                         # CI（PR 触发）
```

---

## 4. 核心流程

### 4.1 登录流程

```
小程序启动
  → app.ts initApp()
    → initCloud() 初始化云开发
    → wxLogin() 调用 login 云函数
      → 云函数获取 OPENID
      → 查询/创建用户记录
      → 初始化配额（新用户）
    → 更新 userStore
    → fetchQuota() 拉取配额
    → 更新 quotaStore
```

### 4.2 占卜流程

```
首页 → 问题选择 → 牌阵选择 → 洗牌 → 选牌 → 翻牌 → 结果
  │
  ├─ divinationStore.setQuestion(category, question)
  ├─ divinationStore.setSpreadType(type)
  ├─ drawCards() 调用 divination 云函数
  │   ├─ quota.deductQuota() 原子扣减配额
  │   ├─ Fisher-Yates 洗牌 + 随机正逆位
  │   └─ 保存占卜记录
  ├─ addSelectedCard() 逐张揭露
  └─ interpretDivination() 调用 ai-interpret 云函数
      ├─ 查询牌义（批量）
      ├─ 组装 Prompt
      ├─ Claude → GPT → 预设模板（三级降级）
      ├─ 安全过滤 + 免责声明
      └─ 缓存结果（5分钟 TTL）
```

### 4.3 支付流程

```
配额不足 → PayWallModal → 套餐页
  → createOrder() 调用 order 云函数
    → 创建订单记录
    → cloud.cloudPay.unifiedOrder()
    → 返回支付参数
  → Taro.requestPayment() 拉起微信支付
  → 支付成功回调
    → 发放配额（_.inc 原子操作）
    → 更新订单状态
  → 跳转支付结果页
    → fetchQuota() 刷新配额
```

---

## 5. 安全架构

### 5.1 认证机制

- **微信云开发自定义登录态**：云函数通过 `cloud.getWXContext()` 获取 `OPENID`，无需 JWT
- **前端 token**：仅用于本地标识登录状态，不参与鉴权

### 5.2 数据安全

- **云数据库权限**：仅创建者可读写自己的数据（`_openid` 字段隔离）
- **敏感信息**：API Key 存储在云函数环境变量中，不暴露给前端

### 5.3 AI 安全

- **安全过滤**：绝对化表述替换（7 组规则）+ 专业领域检测引导
- **免责声明**：自动拼接到解读末尾
- **Prompt 注入防护**：系统 Prompt 与用户输入分离

---

## 6. 性能优化

### 6.1 前端

- **代码分包**：webpack splitChunks 四级分包（taro/react/zustand/vendors）
- **编译缓存**：filesystem 缓存加速二次编译
- **低端设备降级**：performance.ts 检测设备性能，自动关闭昂贵动画
- **打字机效果**：TypewriterText 组件模拟流式输出体验

### 6.2 云函数

- **解读缓存**：同用户+同牌+同类别 5 分钟内命中缓存
- **批量查询**：牌义使用 `db.command.in()` 批量查询
- **原子操作**：配额扣减使用 `where({ field: _.gt(0) }) + _.inc(-1)` 防竞态

---

## 7. 附录：技术栈版本

| 技术 | 版本 |
|------|------|
| Taro | 3.6.35 |
| React | 18.2 |
| TypeScript | 5.4 |
| Zustand | 4.x |
| Node.js (云函数) | 18 |
| wx-server-sdk | latest |
