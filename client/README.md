# 灵谕 — AI 塔罗牌小程序（客户端）

## 技术栈

- **框架**：Taro 3.6+ (React 18 + TypeScript)
- **状态管理**：Zustand 4.x
- **样式**：SCSS
- **UI 库**：Taro UI 3.x
- **日期处理**：dayjs

## 快速开始

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:weapp

# H5 开发
npm run dev:h5

# 构建
npm run build:weapp

# 类型检查
npm run type-check

# 代码格式化
npm run prettier
```

## 项目结构

```
client/
├── config/                    # Taro 编译配置
│   ├── index.ts
│   ├── dev.ts
│   └── prod.ts
├── src/
│   ├── app.ts                # 应用入口
│   ├── app.config.ts         # 小程序配置（路由、TabBar）
│   ├── app.scss              # 全局样式
│   ├── pages/                # 页面
│   ├── components/           # 公共组件
│   ├── store/                # Zustand 状态管理
│   ├── services/             # API 调用封装
│   ├── utils/                # 工具函数
│   ├── styles/               # 全局样式变量
│   └── assets/               # 静态资源
├── project.config.json       # 微信小程序项目配置
├── package.json
├── tsconfig.json
└── .env.example              # 环境变量示例
```

## 开发规范

- 使用 TypeScript 严格模式
- 组件使用 React Hooks + FC 模式
- 注释使用中文
- 样式使用 SCSS，遵循 BEM 命名
- 网络请求统一通过 `services/http.ts` 封装

## 环境配置

复制 `.env.example` 为 `.env`，填入实际的 API 地址和 AppID。
