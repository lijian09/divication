# 灵谕 — AI 塔罗牌小程序

以严谨的占星逻辑为内核，以 AI 大模型为效率工具，以高审美的视觉交互为外壳，为用户提供缓解现实焦虑、提供情绪价值的数字占卜体验。

> 产品定位：打娱乐牌、走心理路、做情绪价值

## 技术架构

```
┌─────────────────────────────────────────────────┐
│               微信小程序 (Taro 3.6)              │
│      React 18 + TypeScript + Zustand + SCSS     │
├──────────┬──────────┬───────────┬───────────────┤
│  17 页面  │  9 组件   │  5 Store  │   7 Service   │
├──────────┴──────────┴───────────┴───────────────┤
│             微信云开发 (CloudBase)                │
│       云函数 (Node.js) + 云数据库 (JSON)         │
├────────┬────────┬─────────┬────────┬────────────┤
│ login  │  card  │ divi-   │ quota  │   order    │
│ 用户认证│  牌义   │ nation  │  配额   │   支付     │
│        │        │  占卜    │        │            │
├────────┴────────┴─────────┴────────┴────────────┤
│              ai-interpret (AI 解读)              │
│    Prompt 模板 → Claude/GPT → 安全过滤 → 存储    │
└─────────────────────────────────────────────────┘
```

### 技术选型

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Taro + React | 3.6 / 18 |
| 状态管理 | Zustand | 4.x |
| 样式方案 | SCSS（变量/Mixin/动画系统） | - |
| 后端 | 微信云开发（云函数） | Node.js 18 |
| 数据库 | 云数据库（JSON） | - |
| 认证 | 微信登录 + 自定义登录态 | - |
| AI | Claude Messages API / GPT（降级） | - |
| 支付 | 微信支付（云调用） | - |
| CI | GitHub Actions（PR 触发） | - |

## 项目结构

```
divination/
├── client/                        # 微信小程序前端（Taro）
│   └── src/
│       ├── pages/                 # 17 个页面
│       │   ├── home/                  # 首页（品牌+运势+快捷入口）
│       │   ├── onboarding/            # 引导页
│       │   ├── question-select/       # 问题选择（5类别+自定义）
│       │   ├── spread-select/         # 牌阵选择（单牌/三牌阵）
│       │   ├── shuffle/               # 洗牌动画
│       │   ├── pick-card/             # 选牌交互
│       │   ├── reveal/                # 翻牌揭晓（3D动画）
│       │   ├── result-single/         # 单牌结果+AI解读
│       │   ├── result-three/          # 三牌阵结果+AI解读
│       │   ├── history-list/          # 历史记录列表
│       │   ├── history-detail/        # 历史记录详情
│       │   ├── profile/               # 个人中心
│       │   ├── packages/              # 付费套餐
│       │   ├── payment-result/        # 支付结果
│       │   ├── settings/              # 设置
│       │   ├── loading/               # 加载页
│       │   └── error/                 # 错误页
│       │
│       ├── components/            # 9 个通用组件
│       │   ├── TarotCard/             # 塔罗牌（3D翻转+正逆位+多尺寸）
│       │   ├── ShuffleDeck/           # 洗牌动画（手势+进度条）
│       │   ├── CardSpread/            # 牌阵布局（单牌/三牌阵）
│       │   ├── StarBackground/        # 星空粒子背景（星云光晕）
│       │   ├── AiLoading/             # AI解读加载（星形旋转+诗句轮播）
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
│       │   ├── cloud.ts               # 云开发基础封装（wx.cloud.callFunction）
│       │   ├── auth.ts                # 登录+协议确认
│       │   ├── card.ts                # 牌义查询
│       │   ├── divination.ts          # 抽牌+AI解读
│       │   ├── quota.ts               # 配额查询+扣减
│       │   ├── order.ts               # 订单+支付
│       │   └── http.ts                # HTTP 请求封装（兼容旧模式）
│       │
│       ├── styles/                # 全局样式
│       │   ├── variables.scss         # 色彩/字体/间距/动画变量
│       │   ├── mixins.scss            # 布局/按钮/卡片/遮罩 Mixin
│       │   ├── animation.scss         # 关键帧动画（洗牌/翻牌/星星/弹窗）
│       │   └── reset.scss             # 样式重置
│       │
│       ├── assets/                # 静态资源
│       │   ├── images/                # 图片（背景/牌面/图标）
│       │   ├── fonts/                 # 字体
│       │   └── lottie/                # Lottie 动画
│       │
│       └── utils/                 # 工具函数
│           ├── constants.ts           # 路由/分类/预设问题常量
│           └── error.ts               # 错误分类+统一处理
│
├── cloud/                         # 微信云开发后端
│   ├── functions/                 # 6 个云函数
│   │   ├── login/                     # 微信登录（code2Session）
│   │   ├── card/                      # 牌义查询（78张牌数据）
│   │   ├── divination/                # 抽牌（Fisher-Yates）+ 占卜记录
│   │   ├── ai-interpret/              # AI 解读（Claude/GPT + 安全过滤 + 降级）
│   │   ├── quota/                     # 配额管理（每日重置 + 扣减）
│   │   └── order/                     # 订单管理 + 微信支付统一下单
│   └── database/
│       └── cards.json                 # 78 张塔罗牌种子数据
│
├── docs/                          # 设计文档
│   ├── market-research.md             # 市场调研（6家竞品分析）
│   ├── PRD.md                         # 产品需求（23条用户故事）
│   ├── prototype.md                   # 原型图（18页ASCII线框图）
│   ├── architecture.md                # 架构设计
│   ├── database.md                    # 数据库设计（10张表+E-R图）
│   ├── ui-design-spec.md              # UI/UX设计规范
│   └── DEVLOG.md                      # 开发日志
│
└── .github/workflows/
    └── ci.yml                         # CI（PR触发：lint+type-check+build）
```

## 已完成功能

### Sprint 2.1 — 用户登录 ✅
- 微信一键登录（code → openid → 自定义登录态）
- 首次使用免责协议弹窗（IP/UA 记录）

### Sprint 2.2 — 问题选择 ✅
- 5 类问题选择（爱情/事业/财运/健康/综合）+ 高亮选中态
- 自定义问题输入（100 字校验 + 预设问题推荐）
- 牌阵选择（单牌/三牌阵）+ 剩余次数展示 + 配额联动

### Sprint 2.3 — 抽牌核心交互 ✅
- 洗牌动画组件（手势滑动进度条 + CSS 卡牌交错）
- 选牌交互（牌堆点击 → 逐张揭露真实牌面）
- 翻牌动画（3D rotateY 翻转 + 正逆位标识）
- 云函数 Fisher-Yates 洗牌算法 + 随机正逆位
- 配额扣减（免费优先 → 付费 → 不足抛 402）

### Sprint 2.4 — 牌义展示 ✅
- 牌义查询接口（按正逆位返回关键词和含义）
- 单牌/三牌结果页展示完整牌义 + 关键词

### Sprint 3.1 — AI 解读 ✅
- Prompt 模板引擎（单牌/三牌阵模板 + 牌义注入）
- Claude Messages API 调用 + GPT 降级
- 输出安全过滤（绝对化表述替换 + 专业领域引导 + 免责声明）
- LLM 降级方案（预设模板解读）

### Sprint 3.2 — 云开发部署 ✅
- 6 个微信云函数 + 云数据库牌库数据
- 前端云开发适配（cloud.ts 服务封装）
- 移除 NestJS 后端 + Docker 部署

### Sprint 3.3 — 个人中心 & 配额 ✅
- 个人中心页（头像/昵称/配额余额/功能菜单）
- 每日免费次数重置（跨天自动刷新）
- 配额不足弹窗引导购买

### Sprint 4.1/4.2 — 付费套餐 & 微信支付 ✅
- 套餐列表页（卡片式布局 + 价格 + 次数说明）
- 微信支付统一下单 + 拉起支付
- 支付结果页（成功/失败/处理中）

### Sprint 4.3 — 端到端联调 ✅
- 全链路联调：登录 → 抽牌 → AI 解读 → 历史记录
- 全链路联调：配额用完 → 付费 → 再抽牌
- 异常处理：网络断开/超时/接口错误的兜底 UI

### Sprint 5.1 — 视觉还原 ✅
- 首页：品牌区渐变文字+双星装饰、运势卡片缩略图布局、CTA 光晕动效
- 抽牌流程：洗牌进度指示点、牌背金色内框、翻牌入场动画
- 结果页：牌面金色光晕、AI 解读区边框装饰、递进动画
- 全局：StarBackground 星云光晕、组件统一视觉打磨

### 基础设施 ✅
- GitHub Actions CI（PR 自动 lint + type-check + build）

## 快速开始

### 前置条件

- Node.js >= 18
- 微信开发者工具
- 已开通微信云开发环境

### 启动

```bash
cd client

npm install
npm run dev:weapp
```

用微信开发者工具打开 `client/dist` 目录预览。云函数直接部署到微信云开发环境。

## 核心流程

```
首页 → 免责协议确认
  → 问题选择（5 类别 + 自定义）
    → 牌阵选择（单牌 / 三牌阵）
      → 洗牌动画（手势滑动）
        → 选牌（云函数 Fisher-Yates + 随机正逆位）
          → 翻牌揭晓（3D 动画）
            → 牌义展示 + AI 解读（Claude/GPT + 安全过滤）
              → 保存历史记录
```

## 付费流程

```
配额检查 → 免费次数用尽
  → 付费墙弹窗引导
    → 套餐选择页
      → 微信支付统一下单
        → 拉起微信支付
          → 支付回调 → 配额发放
            → 返回继续占卜
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
