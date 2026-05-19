# 灵谕 — AI 塔罗牌小程序 数据库设计文档

> **版本**：v1.0
> **撰写日期**：2026-05-19
> **数据库**：MySQL 8.0
> **字符集**：utf8mb4（支持 Emoji）
> **存储引擎**：InnoDB（事务支持）

---

## 1. E-R 关系图（ASCII）

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────┐
│   packages   │       │      orders       │       │    users     │
│──────────────│       │───────────────────│       │──────────────│
│ id (PK)      │◄──────│ package_id (FK)   │       │ id (PK)      │
│ name         │  N:1  │ user_id (FK)      │──────►│ openid       │
│ price        │       │ amount            │  N:1  │ nickname     │
│ single_count │       │ status            │       │ avatar_url   │
│ three_count  │       │ wx_transaction_id │       │ ...          │
└──────────────┘       └───────────────────┘       └──────┬───────┘
                                                          │
                               ┌──────────────────────────┼──────────────────────┐
                               │                          │                      │
                               │ 1:1                      │ 1:N                  │ 1:N
                               ▼                          ▼                      ▼
                    ┌──────────────────┐    ┌─────────────────────┐  ┌───────────────────────┐
                    │  usage_quotas    │    │ divination_records  │  │  disclaimer_logs      │
                    │──────────────────│    │─────────────────────│  │───────────────────────│
                    │ id (PK)          │    │ id (PK)             │  │ id (PK)               │
                    │ user_id (FK UQ)  │    │ user_id (FK)        │  │ user_id (FK)          │
                    │ free_single_...  │    │ question_category   │  │ accepted_at           │
                    │ free_three_...   │    │ question_text       │  │ agreement_version     │
                    │ paid_single_...  │    │ spread_type         │  └───────────────────────┘
                    │ paid_three_...   │    │ cards (JSON)        │
                    └──────────────────┘    │ ai_interpretation   │
                                            │ ai_model            │
                                            │ status              │
                                            └──────────┬──────────┘
                                                       │
                                                       │ N:1
                                                       ▼
                                            ┌─────────────────────┐
                                            │  card_spreads       │
                                            │─────────────────────│
                                            │ id (PK)             │
                                            │ name                │
                                            │ type (single/three) │
                                            │ position_count      │
                                            └─────────────────────┘
                                                       │
                                                       │ 1:N
                                                       ▼
                                            ┌─────────────────────┐
                                            │ spread_positions    │
                                            │─────────────────────│
                                            │ id (PK)             │
                                            │ spread_id (FK)      │
                                            │ position_name       │
                                            │ description         │
                                            └─────────────────────┘

┌──────────────┐       ┌──────────────────────┐
│    cards     │       │  ai_interpretations  │
│──────────────│       │──────────────────────│
│ id (PK)      │       │ id (PK)              │
│ name_cn      │       │ record_id (FK UQ)    │
│ name_en      │       │ raw_content          │
│ arcana_type  │       │ filtered_content     │
│ suit         │       │ prompt_tokens        │
│ upright_...  │       │ completion_tokens    │
│ reversed_... │       │ model                │
│ ...          │       │ status               │
└──────────────┘       └──────────────────────┘
```

**核心关系总结**：

| 关系 | 类型 | 说明 |
|------|------|------|
| users → divination_records | 1:N | 一个用户有多条占卜记录 |
| users → orders | 1:N | 一个用户可以下多笔订单 |
| users → usage_quotas | 1:1 | 一个用户只有一条配额记录 |
| users → disclaimer_logs | 1:N | 记录用户每次协议确认 |
| packages → orders | 1:N | 一个套餐可对应多笔订单 |
| card_spreads → spread_positions | 1:N | 一个牌阵有多个位置 |
| divination_records → card_spreads | N:1 | 占卜记录关联牌阵类型 |
| divination_records → ai_interpretations | 1:1 | 一条记录对应一条 AI 解读 |

---

## 2. 完整表结构

### 2.1 users — 用户表

```sql
-- 表名：users
-- 说明：存储微信小程序用户的基础信息
CREATE TABLE `users` (
  `id`              VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `openid`          VARCHAR(64)   NOT NULL COMMENT '微信 OpenID',
  `unionid`         VARCHAR(64)   DEFAULT NULL COMMENT '微信 UnionID（多应用互通）',
  `nickname`        VARCHAR(80)   NOT NULL DEFAULT '灵谕用户' COMMENT '昵称',
  `avatar_url`      VARCHAR(512)  DEFAULT NULL COMMENT '头像 URL',
  `gender`          TINYINT       NOT NULL DEFAULT 0 COMMENT '性别：0-未知 1-男 2-女',
  `agreement_accepted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否同意免责协议',
  `agreement_accepted_at` DATETIME DEFAULT NULL COMMENT '协议同意时间',
  `status`          TINYINT       NOT NULL DEFAULT 1 COMMENT '状态：1-正常 0-禁用 -1-注销',
  `last_login_at`   DATETIME      DEFAULT NULL COMMENT '最后登录时间',
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

### 2.2 divination_records — 占卜记录表

```sql
-- 表名：divination_records
-- 说明：存储每次占卜的完整记录，包括问题、牌面、AI 解读
CREATE TABLE `divination_records` (
  `id`                  VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `user_id`             VARCHAR(36)   NOT NULL COMMENT '用户 ID',
  `question_category`   VARCHAR(20)   NOT NULL COMMENT '问题类别：love/career/finance/health/general',
  `question_text`       VARCHAR(400)  NOT NULL COMMENT '用户问题原文（UTF8 最多 100 字）',
  `spread_type`         VARCHAR(10)   NOT NULL COMMENT '牌阵类型：single/three',
  `spread_id`           VARCHAR(36)   DEFAULT NULL COMMENT '关联牌阵定义 ID',
  `cards`               JSON          NOT NULL COMMENT '抽到的牌列表：[{card_id, position, is_reversed, position_name}]',
  `ai_model`            VARCHAR(50)   NOT NULL COMMENT '使用的 AI 模型标识，如 claude-sonnet-4-20250514',
  `status`              VARCHAR(20)   NOT NULL DEFAULT 'completed' COMMENT '状态：pending/completed/failed',
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '占卜时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_created` (`user_id`, `created_at` DESC),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='占卜记录表';
```

### 2.3 cards — 牌义数据表

```sql
-- 表名：cards
-- 说明：存储标准 78 张塔罗牌的牌义数据（静态数据表）
CREATE TABLE `cards` (
  `id`                VARCHAR(20)   NOT NULL COMMENT '牌标识，如 major_00, wands_01',
  `name_cn`           VARCHAR(20)   NOT NULL COMMENT '中文名，如"愚人"',
  `name_en`           VARCHAR(40)   NOT NULL COMMENT '英文名，如"The Fool"',
  `arcana_type`       VARCHAR(10)   NOT NULL COMMENT '大阿卡纳 major / 小阿卡纳 minor',
  `suit`              VARCHAR(15)   DEFAULT NULL COMMENT '小阿卡纳花色：wands/cups/swords/pentacles，大牌为 NULL',
  `number`            INT           NOT NULL COMMENT '序号（大牌 0-21，小牌 1-14）',
  `image_url`         VARCHAR(512)  NOT NULL COMMENT '牌面图片 URL',
  `upright_keywords`  VARCHAR(200)  NOT NULL COMMENT '正位关键词，逗号分隔',
  `reversed_keywords` VARCHAR(200)  NOT NULL COMMENT '逆位关键词，逗号分隔',
  `upright_meaning`   TEXT          NOT NULL COMMENT '正位详解',
  `reversed_meaning`  TEXT          NOT NULL COMMENT '逆位详解',
  `sort_order`        INT           NOT NULL DEFAULT 0 COMMENT '全局排序权重',
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_arcana_suit` (`arcana_type`, `suit`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='塔罗牌义数据表';
```

### 2.4 card_spreads — 牌阵定义表

```sql
-- 表名：card_spreads
-- 说明：存储牌阵类型定义
CREATE TABLE `card_spreads` (
  `id`               VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `name`             VARCHAR(20)   NOT NULL COMMENT '牌阵名称，如"单牌阵"、"三牌阵"',
  `type`             VARCHAR(10)   NOT NULL COMMENT '牌阵类型标识：single/three',
  `description`      VARCHAR(200)  NOT NULL COMMENT '牌阵说明',
  `position_count`   INT           NOT NULL COMMENT '需要抽取的牌数',
  `is_active`        TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '是否启用',
  `sort_order`       INT           NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type` (`type`),
  KEY `idx_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='牌阵定义表';
```

### 2.5 spread_positions — 牌阵位置定义表

```sql
-- 表名：spread_positions
-- 说明：定义每种牌阵中各位置的含义
CREATE TABLE `spread_positions` (
  `id`               VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `spread_id`        VARCHAR(36)   NOT NULL COMMENT '关联牌阵 ID',
  `position_index`   INT           NOT NULL COMMENT '位置序号（从 1 开始）',
  `position_name`    VARCHAR(20)   NOT NULL COMMENT '位置名称，如"过去"、"现在"、"未来"',
  `description`      VARCHAR(200)  NOT NULL COMMENT '位置含义说明',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spread_index` (`spread_id`, `position_index`),
  CONSTRAINT `fk_position_spread` FOREIGN KEY (`spread_id`) REFERENCES `card_spreads`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='牌阵位置定义表';
```

### 2.6 orders — 订单表

```sql
-- 表名：orders
-- 说明：存储用户付费订单信息
CREATE TABLE `orders` (
  `id`                  VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `order_no`            VARCHAR(64)   NOT NULL COMMENT '业务订单号（唯一）',
  `user_id`             VARCHAR(36)   NOT NULL COMMENT '用户 ID',
  `package_id`          VARCHAR(36)   NOT NULL COMMENT '套餐 ID',
  `package_name`        VARCHAR(40)   NOT NULL COMMENT '套餐名称（冗余，方便查询）',
  `amount`              INT           NOT NULL COMMENT '支付金额（单位：分），如 690 = ¥6.9',
  `currency`            VARCHAR(10)   NOT NULL DEFAULT 'CNY' COMMENT '货币',
  `status`              VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending/paid/refunded/failed/cancelled',
  `wx_transaction_id`   VARCHAR(64)   DEFAULT NULL COMMENT '微信支付交易号',
  `wx_prepay_id`        VARCHAR(128)  DEFAULT NULL COMMENT '微信预支付 ID',
  `paid_at`             DATETIME      DEFAULT NULL COMMENT '支付完成时间',
  `notify_attempts`     INT           NOT NULL DEFAULT 0 COMMENT '回调处理尝试次数',
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `updated_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id_created` (`user_id`, `created_at` DESC),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_wx_transaction_id` (`wx_transaction_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
```

### 2.7 usage_quotas — 使用配额表

```sql
-- 表名：usage_quotas
-- 说明：记录用户的使用配额（免费次数 + 付费次数）
CREATE TABLE `usage_quotas` (
  `id`                      VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `user_id`                 VARCHAR(36)   NOT NULL COMMENT '用户 ID',
  `free_single_remaining`   INT           NOT NULL DEFAULT 1 COMMENT '当日免费单牌剩余次数',
  `free_three_remaining`    INT           NOT NULL DEFAULT 1 COMMENT '当日免费三牌剩余次数（新用户首日 1 次，日常 0）',
  `free_reset_date`         DATE          NOT NULL COMMENT '免费次数刷新日期（每日 0 点刷新时更新）',
  `paid_single_remaining`   INT           NOT NULL DEFAULT 0 COMMENT '付费单牌剩余次数',
  `paid_three_remaining`    INT           NOT NULL DEFAULT 0 COMMENT '付费三牌剩余次数',
  `total_paid_single_used`  INT           NOT NULL DEFAULT 0 COMMENT '历史累计消耗付费单牌次数（统计用）',
  `total_paid_three_used`   INT           NOT NULL DEFAULT 0 COMMENT '历史累计消耗付费三牌次数（统计用）',
  `created_at`              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_quota_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用配额表';
```

### 2.8 packages — 付费套餐表

```sql
-- 表名：packages
-- 说明：存储可购买的付费套餐定义
CREATE TABLE `packages` (
  `id`            VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `name`          VARCHAR(40)   NOT NULL COMMENT '套餐名称，如"小确幸包"',
  `code`          VARCHAR(20)   NOT NULL COMMENT '套餐标识码，如 small_happy / warm / deep',
  `price`         INT           NOT NULL COMMENT '价格（单位：分），如 690 = ¥6.9',
  `single_count`  INT           NOT NULL COMMENT '包含单牌次数',
  `three_count`   INT           NOT NULL COMMENT '包含三牌次数',
  `description`   VARCHAR(200)  DEFAULT NULL COMMENT '套餐描述',
  `is_active`     TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '是否上架',
  `sort_order`    INT           NOT NULL DEFAULT 0 COMMENT '排序权重（升序）',
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='付费套餐表';
```

### 2.9 ai_interpretations — AI 解读结果表

```sql
-- 表名：ai_interpretations
-- 说明：存储 AI 生成的解读原文和过滤后的内容，与占卜记录 1:1 关联
CREATE TABLE `ai_interpretations` (
  `id`                  VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `record_id`           VARCHAR(36)   NOT NULL COMMENT '关联占卜记录 ID',
  `prompt_text`         TEXT          NOT NULL COMMENT '发送给 AI 的完整 Prompt',
  `raw_content`         TEXT          NOT NULL COMMENT 'AI 原始返回内容（含免责追加前）',
  `filtered_content`    TEXT          NOT NULL COMMENT '安全过滤后的内容（最终展示给用户）',
  `model`               VARCHAR(50)   NOT NULL COMMENT '实际使用的 AI 模型',
  `prompt_tokens`       INT           DEFAULT 0 COMMENT 'Prompt Token 消耗',
  `completion_tokens`   INT           DEFAULT 0 COMMENT 'Completion Token 消耗',
  `total_tokens`        INT           DEFAULT 0 COMMENT '总 Token 消耗',
  `latency_ms`          INT           DEFAULT 0 COMMENT 'AI 响应耗时（毫秒）',
  `status`              VARCHAR(20)   NOT NULL DEFAULT 'success' COMMENT 'success/filtered/fallback/error',
  `error_message`       VARCHAR(500)  DEFAULT NULL COMMENT '错误信息（仅 status=error 时）',
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_id` (`record_id`),
  KEY `idx_model_status` (`model`, `status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_interpretation_record` FOREIGN KEY (`record_id`) REFERENCES `divination_records`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 解读结果表';
```

### 2.10 disclaimer_logs — 免责协议确认记录表

```sql
-- 表名：disclaimer_logs
-- 说明：记录用户每次确认免责协议的流水（用户可能多次确认不同版本）
CREATE TABLE `disclaimer_logs` (
  `id`                VARCHAR(36)   NOT NULL COMMENT '主键，UUID',
  `user_id`           VARCHAR(36)   NOT NULL COMMENT '用户 ID',
  `agreement_version` VARCHAR(20)   NOT NULL DEFAULT 'v1.0' COMMENT '协议版本号',
  `accepted_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '确认时间',
  `client_ip`         VARCHAR(45)   DEFAULT NULL COMMENT '确认时的客户端 IP',
  `user_agent`        VARCHAR(512)  DEFAULT NULL COMMENT '客户端标识',
  PRIMARY KEY (`id`),
  KEY `idx_user_version` (`user_id`, `agreement_version`),
  KEY `idx_accepted_at` (`accepted_at`),
  CONSTRAINT `fk_disclaimer_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='免责协议确认记录表';
```

---

## 3. 数据字典

### 3.1 users（用户表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID v4 |
| openid | VARCHAR(64) | 是 | - | 微信 OpenID，唯一 |
| unionid | VARCHAR(64) | 否 | NULL | 微信 UnionID |
| nickname | VARCHAR(80) | 是 | '灵谕用户' | 用户昵称 |
| avatar_url | VARCHAR(512) | 否 | NULL | 头像 URL |
| gender | TINYINT | 是 | 0 | 0-未知 1-男 2-女 |
| agreement_accepted | TINYINT(1) | 是 | 0 | 是否同意免责协议 |
| agreement_accepted_at | DATETIME | 否 | NULL | 同意协议时间 |
| status | TINYINT | 是 | 1 | 1-正常 0-禁用 -1-注销 |
| last_login_at | DATETIME | 否 | NULL | 最后登录时间 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 注册时间 |
| updated_at | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 3.2 divination_records（占卜记录表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| user_id | VARCHAR(36) | 是 | - | 用户 ID，外键 |
| question_category | VARCHAR(20) | 是 | - | love/career/finance/health/general |
| question_text | VARCHAR(400) | 是 | - | 用户问题原文 |
| spread_type | VARCHAR(10) | 是 | - | single/three |
| spread_id | VARCHAR(36) | 否 | NULL | 牌阵定义 ID |
| cards | JSON | 是 | - | 抽到的牌列表 |
| ai_model | VARCHAR(50) | 是 | - | AI 模型标识 |
| status | VARCHAR(20) | 是 | 'completed' | pending/completed/failed |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 占卜时间 |

**cards JSON 结构示例**：
```json
[
  {
    "card_id": "major_00",
    "position": 1,
    "position_name": "核心主题",
    "is_reversed": false
  }
]
```

三牌阵示例：
```json
[
  { "card_id": "major_05", "position": 1, "position_name": "过去", "is_reversed": true },
  { "card_id": "cups_02", "position": 2, "position_name": "现在", "is_reversed": false },
  { "card_id": "wands_10", "position": 3, "position_name": "未来", "is_reversed": false }
]
```

### 3.3 cards（牌义数据表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(20) | 是 | - | 主键，如 major_00, wands_01 |
| name_cn | VARCHAR(20) | 是 | - | 中文名 |
| name_en | VARCHAR(40) | 是 | - | 英文名 |
| arcana_type | VARCHAR(10) | 是 | - | major/minor |
| suit | VARCHAR(15) | 否 | NULL | wands/cups/swords/pentacles |
| number | INT | 是 | - | 序号 |
| image_url | VARCHAR(512) | 是 | - | 牌面图片 URL |
| upright_keywords | VARCHAR(200) | 是 | - | 正位关键词，逗号分隔 |
| reversed_keywords | VARCHAR(200) | 是 | - | 逆位关键词，逗号分隔 |
| upright_meaning | TEXT | 是 | - | 正位详解 |
| reversed_meaning | TEXT | 是 | - | 逆位详解 |
| sort_order | INT | 是 | 0 | 全局排序 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 3.4 card_spreads（牌阵定义表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| name | VARCHAR(20) | 是 | - | 牌阵名称 |
| type | VARCHAR(10) | 是 | - | single/three |
| description | VARCHAR(200) | 是 | - | 牌阵说明 |
| position_count | INT | 是 | - | 牌数 |
| is_active | TINYINT(1) | 是 | 1 | 是否启用 |
| sort_order | INT | 是 | 0 | 排序 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |

### 3.5 spread_positions（牌阵位置定义表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| spread_id | VARCHAR(36) | 是 | - | 牌阵 ID，外键 |
| position_index | INT | 是 | - | 位置序号（1 开始） |
| position_name | VARCHAR(20) | 是 | - | 位置名称 |
| description | VARCHAR(200) | 是 | - | 位置含义说明 |

### 3.6 orders（订单表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| order_no | VARCHAR(64) | 是 | - | 业务订单号，唯一 |
| user_id | VARCHAR(36) | 是 | - | 用户 ID，外键 |
| package_id | VARCHAR(36) | 是 | - | 套餐 ID |
| package_name | VARCHAR(40) | 是 | - | 套餐名称（冗余） |
| amount | INT | 是 | - | 金额（分） |
| currency | VARCHAR(10) | 是 | 'CNY' | 货币 |
| status | VARCHAR(20) | 是 | 'pending' | 订单状态 |
| wx_transaction_id | VARCHAR(64) | 否 | NULL | 微信交易号 |
| wx_prepay_id | VARCHAR(128) | 否 | NULL | 微信预支付 ID |
| paid_at | DATETIME | 否 | NULL | 支付时间 |
| notify_attempts | INT | 是 | 0 | 回调尝试次数 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 下单时间 |
| updated_at | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 3.7 usage_quotas（使用配额表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| user_id | VARCHAR(36) | 是 | - | 用户 ID，唯一索引 |
| free_single_remaining | INT | 是 | 1 | 免费单牌剩余 |
| free_three_remaining | INT | 是 | 1 | 免费三牌剩余 |
| free_reset_date | DATE | 是 | - | 免费次数刷新日期 |
| paid_single_remaining | INT | 是 | 0 | 付费单牌剩余 |
| paid_three_remaining | INT | 是 | 0 | 付费三牌剩余 |
| total_paid_single_used | INT | 是 | 0 | 累计消耗付费单牌 |
| total_paid_three_used | INT | 是 | 0 | 累计消耗付费三牌 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 3.8 packages（付费套餐表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| name | VARCHAR(40) | 是 | - | 套餐名称 |
| code | VARCHAR(20) | 是 | - | 套餐标识码 |
| price | INT | 是 | - | 价格（分） |
| single_count | INT | 是 | - | 单牌次数 |
| three_count | INT | 是 | - | 三牌次数 |
| description | VARCHAR(200) | 否 | NULL | 描述 |
| is_active | TINYINT(1) | 是 | 1 | 是否上架 |
| sort_order | INT | 是 | 0 | 排序 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 3.9 ai_interpretations（AI 解读结果表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| record_id | VARCHAR(36) | 是 | - | 占卜记录 ID，唯一 |
| prompt_text | TEXT | 是 | - | 完整 Prompt |
| raw_content | TEXT | 是 | - | AI 原始返回 |
| filtered_content | TEXT | 是 | - | 过滤后内容 |
| model | VARCHAR(50) | 是 | - | AI 模型 |
| prompt_tokens | INT | 否 | 0 | Prompt Token 数 |
| completion_tokens | INT | 否 | 0 | Completion Token 数 |
| total_tokens | INT | 否 | 0 | 总 Token 数 |
| latency_ms | INT | 否 | 0 | 响应耗时 |
| status | VARCHAR(20) | 是 | 'success' | success/filtered/fallback/error |
| error_message | VARCHAR(500) | 否 | NULL | 错误信息 |
| created_at | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |

### 3.10 disclaimer_logs（免责协议确认记录表）

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | VARCHAR(36) | 是 | - | 主键，UUID |
| user_id | VARCHAR(36) | 是 | - | 用户 ID |
| agreement_version | VARCHAR(20) | 是 | 'v1.0' | 协议版本 |
| accepted_at | DATETIME | 是 | CURRENT_TIMESTAMP | 确认时间 |
| client_ip | VARCHAR(45) | 否 | NULL | 客户端 IP |
| user_agent | VARCHAR(512) | 否 | NULL | 客户端标识 |

---

## 4. 索引设计

### 4.1 索引策略总览

| 表名 | 索引名 | 索引类型 | 索引字段 | 用途 |
|------|--------|----------|----------|------|
| users | PK | 聚簇 | id | 主键查询 |
| users | uk_openid | 唯一 | openid | 登录时根据 openid 查用户 |
| users | idx_unionid | 普通 | unionid | 多应用互通查询 |
| users | idx_created_at | 普通 | created_at | 运营统计：新增用户趋势 |
| divination_records | PK | 聚簇 | id | 主键查询 |
| divination_records | idx_user_id_created | 联合 | user_id, created_at DESC | 历史记录列表（按用户+时间倒序分页） |
| divination_records | idx_user_status | 联合 | user_id, status | 查询用户特定状态的记录 |
| cards | PK | 聚簇 | id | 主键查询 |
| cards | idx_arcana_suit | 联合 | arcana_type, suit | 按大/小阿卡纳 + 花色筛选 |
| cards | idx_sort_order | 普通 | sort_order | 全量列表排序 |
| card_spreads | uk_type | 唯一 | type | 按类型查找牌阵 |
| spread_positions | uk_spread_index | 唯一 | spread_id, position_index | 查找牌阵的某个位置 |
| orders | PK | 聚簇 | id | 主键查询 |
| orders | uk_order_no | 唯一 | order_no | 按订单号查询（支付回调） |
| orders | idx_user_id_created | 联合 | user_id, created_at DESC | 用户订单列表 |
| orders | idx_status_created | 联合 | status, created_at | 定时任务扫描待确认订单 |
| orders | idx_wx_transaction_id | 普通 | wx_transaction_id | 按微信交易号查询 |
| usage_quotas | PK | 聚簇 | id | 主键查询 |
| usage_quotas | uk_user_id | 唯一 | user_id | 按用户查配额（最频繁查询之一） |
| packages | uk_code | 唯一 | code | 按标识码查套餐 |
| ai_interpretations | uk_record_id | 唯一 | record_id | 按占卜记录查解读 |
| ai_interpretations | idx_model_status | 联合 | model, status | 统计各模型的成功率 |
| disclaimer_logs | idx_user_version | 联合 | user_id, agreement_version | 查询用户是否同意某版本协议 |

### 4.2 查询优化建议

**高频查询场景**：

1. **历史记录分页**：`SELECT * FROM divination_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 20 OFFSET ?`
   - 使用联合索引 `(user_id, created_at DESC)` 覆盖查询
   - 当数据量大时（>1万条/用户），考虑游标分页（基于 created_at + id）

2. **配额查询**：`SELECT * FROM usage_quotas WHERE user_id = ?`
   - 唯一索引 `uk_user_id`，同时 Redis 缓存，MySQL 查询仅作兜底

3. **牌义全量查询**：`SELECT * FROM cards ORDER BY sort_order`
   - Redis 缓存 24 小时，MySQL 查询仅在缓存失效时触发

4. **支付回调处理**：`SELECT * FROM orders WHERE order_no = ? AND status = 'pending'`
   - 唯一索引 `uk_order_no`，配合 `SELECT ... FOR UPDATE` 保证幂等

5. **定时任务扫描**：`SELECT * FROM orders WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
   - 联合索引 `(status, created_at)` 覆盖

---

## 5. 初始数据

### 5.1 78 张塔罗牌数据

#### 大阿尔卡纳（Major Arcana）— 22 张

```sql
INSERT INTO `cards` (`id`, `name_cn`, `name_en`, `arcana_type`, `suit`, `number`, `image_url`, `upright_keywords`, `reversed_keywords`, `upright_meaning`, `reversed_meaning`, `sort_order`) VALUES
('major_00', '愚人', 'The Fool', 'major', NULL, 0, '/images/cards/major_00.jpg', '新开始,自由,冒险,天真,潜力', '鲁莽,冒失,停滞,恐惧改变,犹豫', '愚人牌象征着一段全新旅程的开始。你正站在悬崖边，内心充满对未知的好奇与渴望。这张牌鼓励你放下过去的包袱，以开放的心态迎接新的可能性。当你问到"该不该换工作"时，愚人提醒你：有时候最大的风险是不冒任何风险。相信你的直觉，迈出第一步。', '逆位的愚人暗示你可能正被恐惧和犹豫所困。你或许渴望改变，却害怕失败或被嘲笑。此时需要审视：你的犹豫是出于谨慎，还是对未知的过度恐惧？建议先做足准备，再勇敢行动。', 1),
('major_01', '魔术师', 'The Magician', 'major', NULL, 1, '/images/cards/major_01.jpg', '创造力,技能,意志力,自信,资源', '欺骗,操纵,才能浪费,缺乏方向', '魔术师代表你拥有实现目标所需的一切资源和能力。天上的能量通过他汇聚到地面，象征着将想法转化为现实的力量。这张牌告诉你：此刻是你行动的最佳时机，你已经准备好了。运用你的智慧和技能，将梦想变为现实。', '逆位的魔术师提醒你警惕欺骗——可能来自他人，也可能来自自己。你或许拥有才能，却没有善加利用；或许在用花言巧语掩饰内心的不安。此时需要诚实地审视自己的动机和能力。', 2),
('major_02', '女祭司', 'The High Priestess', 'major', NULL, 2, '/images/cards/major_02.jpg', '直觉,潜意识,内在智慧,神秘,静默', '隐藏的动机,浅薄,忽视直觉,过度理性', '女祭司坐在黑白柱子之间，象征着意识与潜意识的交汇。她提醒你：答案不在外面，而在你的内心。当外部世界喧嚣纷杂时，静下心来倾听直觉的声音。这张牌也暗示有些信息尚未浮出水面，需要耐心等待。', '逆位的女祭司可能意味着你正在忽视内心的直觉，过度依赖逻辑分析。或者你过于沉浸在自己的世界里，与现实脱节。建议找到内在智慧与外在行动之间的平衡。', 3),
('major_03', '皇后', 'The Empress', 'major', NULL, 3, '/images/cards/major_03.jpg', '丰盛,母性,创造,自然,滋养', '依赖,空虚,过度保护,创造力受阻', '皇后是丰饶与创造力的象征。她坐在繁茂的花园中，代表着物质和情感上的富足。这张牌暗示你的努力即将迎来丰收，或者一段关系正在茁壮成长。在感情问题中，她预示着温暖、滋养和深层的情感连接。', '逆位的皇后可能暗示创造力的枯竭，或者过度依赖他人给予的滋养。你可能需要重新审视：是在等待外部的给予，还是忽略了自我关爱？', 4),
('major_04', '皇帝', 'The Emperor', 'major', NULL, 4, '/images/cards/major_04.jpg', '权威,结构,秩序,领导力,稳定', '僵化,控制欲,暴政,缺乏纪律', '皇帝代表着稳定的结构和明确的秩序。他坐在石制王座上，象征着坚固的基础和可靠的领导力。这张牌暗示你需要制定清晰的计划，用纪律和毅力去实现目标。在事业问题中，它往往预示着晋升或获得更大的掌控权。', '逆位的皇帝可能暗示过于僵化或控制欲过强。也许你正在用过度的规则束缚自己或他人，导致关系或项目缺乏活力。学会在结构与灵活之间找到平衡。', 5),
('major_05', '教皇', 'The Hierophant', 'major', NULL, 5, '/images/cards/major_05.jpg', '传统,信仰,教育,指导,精神', '叛逆,打破常规,教条,僵化思想', '教皇代表着传统智慧和精神指引。他连接着世俗与神圣，象征着通过学习和传承获得的深层理解。这张牌暗示你可能需要寻求导师的帮助，或者遵循已验证的道路和方法。', '逆位的教皇鼓励你质疑传统，寻找属于自己的道路。现有的规则或权威可能不再适合你的处境。此时是打破旧有模式、探索新方法的好时机。', 6),
('major_06', '恋人', 'The Lovers', 'major', NULL, 6, '/images/cards/major_06.jpg', '爱情,和谐,关系,选择,结合', '失衡,不和谐,价值冲突,错误的选择', '恋人牌象征着深层的情感连接和重要的选择。它可能预示一段新的恋情、现有关系的深化，或者面临一个关乎价值观的重大决定。天使的祝福暗示这个选择与你的最高利益一致。', '逆位的恋人暗示关系中的不和谐，或者你正面临价值观的冲突。可能你在做一个与内心不符的决定，或者一段关系需要重新审视。诚实地面对自己的真实感受。', 7),
('major_07', '战车', 'The Chariot', 'major', NULL, 7, '/images/cards/major_07.jpg', '胜利,意志力,决心,行动,控制', '失去方向,挫败,缺乏控制,攻击性', '战车代表着凭借坚强意志力取得的胜利。驾驭者手中的权杖象征着对内在矛盾力量的掌控。这张牌告诉你：成功来自于决心和行动力，即使前路艰难，坚持就能抵达目标。', '逆位的战车暗示你可能感到失去了方向感，或者内在的力量在相互拉扯。你或许过于急于求成，反而偏离了目标。暂停下来，重新明确你的方向。', 8),
('major_08', '力量', 'Strength', 'major', NULL, 8, '/images/cards/major_08.jpg', '勇气,内在力量,耐心,慈悲,影响力', '自我怀疑,软弱,缺乏信心,不安全感', '力量牌展现的不是蛮力，而是温柔的勇气。女子从容地安抚狮子，象征着用爱与耐心去驾驭内在的野性冲动。这张牌鼓励你：面对困难时，以柔克刚，用内在的力量去感化而非对抗。', '逆位的力量暗示你可能正在与自我怀疑抗争，或者感到力不从心。记住，真正的力量来自于接纳自己的脆弱。适当寻求帮助并不是软弱的表现。', 9),
('major_09', '隐士', 'The Hermit', 'major', NULL, 9, '/images/cards/major_09.jpg', '内省,独处,智慧,引导,沉思', '孤立,孤独,逃避,过度封闭', '隐士在山顶提着灯笼，象征着通过独处和内省获得的智慧。这张牌建议你暂时远离喧嚣，在安静中寻找答案。有时候，最好的指引来自于内心的灯火。', '逆位的隐士可能暗示你过度孤立自己，或者在逃避与他人的连接。独处是充电，孤立是消耗——学会分辨两者的区别。', 10),
('major_10', '命运之轮', 'Wheel of Fortune', 'major', NULL, 10, '/images/cards/major_10.jpg', '命运,转折,机遇,好运,循环', '厄运,抗拒改变,坏运气,失控', '命运之轮提醒我们：变化是永恒的。当你抽到这张牌，意味着一个重要的转折点正在到来。无论是好是坏，它都提醒你顺应变化的潮流，在起伏中保持内心的平衡。', '逆位的命运之轮可能暗示你正在抗拒必要的改变，或者感到被命运捉弄。但请记住：即使在低谷，轮子也终将转回高点。接纳当下的处境，为转变做好准备。', 11),
('major_11', '正义', 'Justice', 'major', NULL, 11, '/images/cards/major_11.jpg', '公正,真相,因果,法律,平衡', '不公,逃避责任,偏见,不诚实', '正义牌手持天平和宝剑，象征着因果的平衡和真相的力量。这张牌提醒你：每一个选择都有其后果，现在是面对真相、承担后果的时刻。在法律相关问题中，它通常预示公正的结果。', '逆位的正义暗示不公正的待遇，或者你在逃避某件事的责任。也可能意味着你对自己或他人的判断带有偏见。重新审视事实，以诚实的态度面对。', 12),
('major_12', '倒吊人', 'The Hanged Man', 'major', NULL, 12, '/images/cards/major_12.jpg', '牺牲,等待,新视角,放下,启示', '拖延,抗拒,无谓的牺牲,固执', '倒吊人以独特的视角看待世界。他自愿悬挂，象征着为了更高层次的理解而做出的牺牲或等待。这张牌暗示：有时候暂停前进，从不同的角度看问题，反而能看到之前忽略的答案。', '逆位的倒吊人可能暗示你在无谓地拖延，或者做出的牺牲并不值得。审视一下：你是在等待有意义的启示，还是在白白浪费时间？', 13),
('major_13', '死神', 'Death', 'major', NULL, 13, '/images/cards/major_13.jpg', '结束,转变,新生,放下,蜕变', '抗拒改变,恐惧,停滞,无法放手', '死神牌并不意味着真正的死亡，而是象征一个周期的结束和新周期的开始。就像冬天为春天让路，某些事物的结束是为了给更好的事物腾出空间。这张牌鼓励你勇敢放下不再适合你的东西。', '逆位的死神暗示你正在死死抓住已经不再适合你的事物不放。改变是不可避免的，抗拒只会增加痛苦。学会优雅地放手，为新的可能性打开大门。', 14),
('major_14', '节制', 'Temperance', 'major', NULL, 14, '/images/cards/major_14.jpg', '平衡,耐心,调和,适度,和谐', '失衡,过度,缺乏耐心,不节制', '节制牌中的天使在两个杯子之间倒水，象征着平衡与融合的艺术。这张牌提醒你：在生活中寻找中庸之道，避免走极端。耐心是此刻最好的盟友，事情正在以最合适的节奏展开。', '逆位的节制暗示生活中的某个方面正在失控——可能是工作与生活的失衡，也可能是情绪的过度波动。找到让你失衡的源头，有意识地进行调整。', 15),
('major_15', '恶魔', 'The Devil', 'major', NULL, 15, '/images/cards/major_15.jpg', '束缚,诱惑,阴影面,执念,物质主义', '解脱,觉醒,释放,恢复自由', '恶魔牌代表着束缚和阴影面。它可能暗示你正被某种不健康的模式所困——可能是物质依赖、有毒的关系，或者限制性的信念。但重要的是：锁链是松的，你随时可以挣脱。', '逆位的恶魔是一个积极的信号，暗示你正在从束缚中解脱。你开始看清那些曾经困住你的模式，并有勇气做出改变。继续走在觉醒的路上。', 16),
('major_16', '高塔', 'The Tower', 'major', NULL, 16, '/images/cards/major_16.jpg', '突变,崩塌,觉醒,解放,真相', '逃避灾难,恐惧改变,延迟毁灭', '高塔被闪电击中，象征着突然的、不可预见的剧变。虽然看起来令人恐惧，但高塔的崩塌是因为它建立在不稳固的基础上。这种剧变实际上是在解放你，让你摆脱虚假的安稳。', '逆位的高塔暗示你可能正在经历内在的动荡，但还在试图维持表面的平静。与其等待不可避免的崩塌，不如主动审视和修复那些不稳固的基础。', 17),
('major_17', '星星', 'The Star', 'major', NULL, 17, '/images/cards/major_17.jpg', '希望,灵感,宁静,信心,疗愈', '绝望,缺乏信心,断开连接,沮丧', '星星是黑暗之后的光明。在高塔的毁灭之后，星星带来了希望和治愈。裸女向水中倒水，象征着纯净和更新。这张牌告诉你：无论经历过什么，希望和信念会引导你走向更好的未来。', '逆位的星星暗示你可能正在经历一段信心低落的时期，感到与内在的灵感断开连接。但请记住，星星从不消失——它只是暂时被云层遮住了。寻找那些能重新点燃你希望的事物。', 18),
('major_18', '月亮', 'The Moon', 'major', NULL, 18, '/images/cards/major_18.jpg', '直觉,潜意识,幻象,恐惧,不确定', '释放恐惧,真相浮现,走出迷茫', '月亮照耀着一条通往未知的道路，龙虾从水中爬出，象征着潜意识的浮现。这张牌暗示你正处于一段不确定的时期，事情可能不像表面看起来那样。此时需要信任直觉，但不要被恐惧所迷惑。', '逆位的月亮是一个积极的信号，暗示真相即将浮出水面，迷雾正在散去。那些曾让你恐惧或困惑的事情即将变得清晰。保持耐心，光明就在前方。', 19),
('major_19', '太阳', 'The Sun', 'major', NULL, 19, '/images/cards/major_19.jpg', '喜悦,成功,活力,乐观,光明', '暂时的阴霾,过度乐观,不切实际', '太阳是最积极的牌之一，象征着光明、温暖和无条件的喜悦。骑在马上的孩子代表着纯真的快乐和新的开始。这张牌告诉你：好日子就在眼前，尽情享受这份光明和温暖。', '逆位的太阳虽然仍带有积极的能量，但可能暗示短暂的阴霾或过度的乐观。确保你的快乐是建立在真实的基础上，而非盲目的乐观。', 20),
('major_20', '审判', 'Judgement', 'major', NULL, 20, '/images/cards/major_20.jpg', '觉醒,重生,审视,召唤,救赎', '自我怀疑,拒绝反思,逃避召唤', '审判牌象征着一个深层的觉醒和重新评估。天使吹响号角，召唤人们审视自己的过去并做出最终的决定。这张牌暗示你正面临一个重要的转折——倾听内心的召唤，做出无悔的选择。', '逆位的审判暗示你可能在逃避自我审视，或者对自己的过去持有过于苛刻的态度。允许自己从过去的错误中学习，而不是被它们困住。', 21),
('major_21', '世界', 'The World', 'major', NULL, 21, '/images/cards/major_21.jpg', '完成,圆满,成就,旅程结束,整合', '未完成,缺乏结局,空虚,延迟', '世界牌代表着一个周期的圆满完成。舞者在花环中起舞，象征着所有元素的和谐统一。这张牌告诉你：你已经完成了一个重要的阶段，所有的努力和经历都汇聚成了此刻的成就。庆祝吧，同时也为下一个旅程做准备。', '逆位的世界暗示某个项目或阶段尚未达到圆满。可能你离目标很近了，但还有最后一步没有完成。审视是什么阻碍了你达成最终的完成。', 22);
```

#### 小阿尔卡纳（Minor Arcana）— 56 张（示例 4 张）

```sql
-- 权杖组（Wands）— 火元素，代表创造力、激情、行动
INSERT INTO `cards` (`id`, `name_cn`, `name_en`, `arcana_type`, `suit`, `number`, `image_url`, `upright_keywords`, `reversed_keywords`, `upright_meaning`, `reversed_meaning`, `sort_order`) VALUES
('wands_01', '权杖王牌', 'Ace of Wands', 'minor', 'wands', 1, '/images/cards/wands_01.jpg', '新机遇,灵感,创造力,潜力,热情', '延迟,缺乏方向,犹豫,错失机会', '权杖王牌象征着创造力和新机遇的爆发。一只从云中伸出的手握住一株正在生长的权杖，代表着新的想法和项目的萌芽。这张牌鼓励你抓住这个灵感，大胆地开始行动。', '逆位的权杖王牌暗示你可能有很多想法，但缺乏付诸行动的勇气或方向。别让完美的计划成为行动的敌人——先迈出第一步。', 23),

('cups_02', '圣杯二', 'Two of Cups', 'minor', 'cups', 2, '/images/cards/cups_02.jpg', '合作,吸引,连接,伙伴关系,和谐', '失衡,分离,沟通不畅,关系紧张', '圣杯二象征着两个人之间的深层连接。这可能是浪漫关系的开始，也可能是重要的商业合作。两张杯子的交汇暗示着情感的共鸣和相互的尊重。', '逆位的圣杯二暗示关系中的失衡或沟通的断裂。可能你和某个重要的人之间出现了误解，需要坦诚地沟通来修复连接。', 38),

('swords_10', '宝剑十', 'Ten of Swords', 'minor', 'swords', 10, '/images/cards/swords_10.jpg', '结束,痛苦,背叛,触底,不可避免', '恢复,重生,最坏已过去,拒绝放弃', '宝剑十是塔罗中最具戏剧性的牌之一。一个人背插十把剑倒在黑暗中，但远处的地平线已经透出曙光。这张牌告诉你：最坏的时刻已经过去了，即使现在看起来一切都在崩塌，黎明就在前方。', '逆位的宝剑十是一个积极的信号——最坏的已经过去，恢复正在进行中。你正在从一段艰难的经历中站起来，虽然过程缓慢，但方向是向上的。', 52),

('pentacles_01', '星币王牌', 'Ace of Pentacles', 'minor', 'pentacles', 1, '/images/cards/pentacles_01.jpg', '新机会,财富,稳定,物质收获,健康', '错失机会,财务不稳,贪婪,物质主义', '星币王牌象征着物质世界的新机遇。一只从云中伸出的手托着一枚金币，下方是繁茂的花园，暗示着通过努力可以获得的丰盛回报。这张牌预示着财务上的好运或一个有潜力的新开始。', '逆位的星币王牌可能暗示一个被错失的财务机会，或者对物质的过度关注让你忽略了生活中其他重要的方面。', 63);
```

### 5.2 牌阵初始数据

```sql
-- 牌阵定义
INSERT INTO `card_spreads` (`id`, `name`, `type`, `description`, `position_count`, `is_active`, `sort_order`) VALUES
('spread_single', '单牌阵', 'single', '抽取一张牌，获取简洁直接的指引。适合日常快速占卜，或针对具体问题寻求一个明确的答案。', 1, 1, 1),
('spread_three', '三牌阵', 'three', '抽取三张牌，分别代表过去、现在和未来。适合深入了解问题的发展脉络，提供更全面的视角。', 3, 1, 2);

-- 单牌阵位置
INSERT INTO `spread_positions` (`id`, `spread_id`, `position_index`, `position_name`, `description`) VALUES
('pos_single_1', 'spread_single', 1, '核心主题', '这张牌代表你问题的核心指引和当前的能量状态');

-- 三牌阵位置
INSERT INTO `spread_positions` (`id`, `spread_id`, `position_index`, `position_name`, `description`) VALUES
('pos_three_1', 'spread_three', 1, '过去', '这张牌代表影响当前 situation 的过去因素'),
('pos_three_2', 'spread_three', 2, '现在', '这张牌代表你当前的状态和面临的挑战'),
('pos_three_3', 'spread_three', 3, '未来', '这张牌代表事情可能的发展方向和结果');
```

### 5.3 付费套餐初始数据

```sql
INSERT INTO `packages` (`id`, `name`, `code`, `price`, `single_count`, `three_count`, `description`, `is_active`, `sort_order`) VALUES
('pkg_small', '小确幸包', 'small_happy', 690, 5, 2, '入门体验，适合偶尔想抽牌看看的你', 1, 1),
('pkg_warm', '知心包', 'warm_heart', 1990, 15, 8, '超值推荐，适合每周想获得指引的你', 1, 2),
('pkg_deep', '深度包', 'deep_explore', 3990, 40, 20, '高频专属，适合深度探索人生的你', 1, 3);
```

---

## 6. Migration 策略

### 6.1 版本管理方式

采用 TypeORM 内置的 Migration 机制：

```
src/database/migrations/
├── 1716096000000-CreateUsersTable.ts
├── 1716096001000-CreateCardsTable.ts
├── 1716096002000-CreateCardSpreadsTable.ts
├── 1716096003000-CreateDivinationRecordsTable.ts
├── 1716096004000-CreateOrdersTable.ts
├── 1716096005000-CreateUsageQuotasTable.ts
├── 1716096006000-CreatePackagesTable.ts
├── 1716096007000-CreateAiInterpretationsTable.ts
├── 1716096008000-CreateDisclaimerLogsTable.ts
└── 1716096009000-SeedInitialData.ts      -- 78 张牌 + 牌阵 + 套餐
```

**命名规范**：`{timestamp}-{描述性名称}.ts`

**命令**：
```bash
# 生成 Migration
npm run migration:generate -- src/database/migrations/AddXxxColumn

# 手动创建 Migration
npm run migration:create -- src/database/migrations/SeedXxxData

# 执行 Migration
npm run migration:run

# 回滚最近一次 Migration
npm run migration:revert
```

### 6.2 回滚方案

1. **每个 Migration 必须实现 `down()` 方法**：确保可回滚
2. **生产环境操作流程**：
   - 先在 staging 环境执行并验证
   - 生产环境执行前备份数据库：`mysqldump --single-transaction`
   - 执行 Migration：`npm run migration:run`
   - 验证无误后标记完成
3. **紧急回滚**：
   - `npm run migration:revert` 回退到上一个版本
   - 严重问题时从备份恢复
4. **数据 Seed 策略**：
   - 初始数据（牌义、牌阵、套餐）作为 Migration 执行
   - 不使用 TypeORM 的 `seed` 功能，统一走 Migration 保证可追溯性

### 6.3 多环境 Migration 执行策略

| 环境 | 触发方式 | 说明 |
|------|----------|------|
| dev | 手动执行 | 本地开发时 `npm run migration:run` |
| staging | CI/CD 自动执行 | 部署时自动 run migration |
| prod | CI/CD + 人工确认 | 部署流程中暂停，确认后执行 |

---

## 附录：数据库 ER 图（文本版完整关系）

```
users ──1:N──> divination_records ──N:1──> card_spreads ──1:N──> spread_positions
  │
  ├──1:1──> usage_quotas
  │
  ├──1:N──> orders ──N:1──> packages
  │
  └──1:N──> disclaimer_logs

divination_records ──1:1──> ai_interpretations
```
