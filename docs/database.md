# 灵谕 — 数据库设计文档

> **版本**：v2.0（云数据库）
> **更新日期**：2026-05-29
> **数据库**：微信云数据库（JSON 文档型）

---

## 1. 概述

项目使用微信云数据库（Cloud Database），基于 JSON 文档型存储，无需预定义 Schema。每个集合对应一个业务实体，文档结构由云函数代码隐式定义。

### 集合清单

| 集合名 | 用途 | 主要字段 |
|--------|------|----------|
| `users` | 用户信息 | _openid, nickname, avatar_url, agreement_accepted |
| `quotas` | 配额信息 | _openid, free_single_remaining, paid_single_remaining |
| `records` | 占卜记录 | _openid, question_category, spread_type, cards, status |
| `interpretations` | AI 解读 | record_id, _openid, filtered_content, model |
| `orders` | 订单信息 | _openid, package_id, amount, status |
| `disclaimer_logs` | 协议确认日志 | _openid, agreement_version |
| `delete_account_logs` | 注销日志 | _openid |
| `interpretation_cache` | 解读缓存 | cache_key, result_data |
| `cards` | 牌义数据（种子） | card_id, name_cn, name_en, arcana_type, suit |

---

## 2. 集合详细设计

### 2.1 users（用户集合）

```json
{
  "_id": "自动生成",
  "_openid": "微信 openid",
  "nickname": "用户昵称",
  "avatar_url": "头像 URL",
  "agreement_accepted": false,
  "agreement_version": null,
  "created_at": "serverDate",
  "updated_at": "serverDate"
}
```

**创建时机**：用户首次登录时由 `login` 云函数自动创建。

### 2.2 quotas（配额集合）

```json
{
  "_id": "自动生成",
  "_openid": "微信 openid",
  "free_single_remaining": 1,
  "free_three_remaining": 0,
  "paid_single_remaining": 0,
  "paid_three_remaining": 0,
  "free_reset_date": "2026-05-29",
  "created_at": "serverDate"
}
```

**业务规则**：
- 新用户初始化：单牌 1 次，三牌 0 次
- 每日重置：`free_reset_date` 跨天时自动重置免费次数
- 配额扣减：原子操作 `where({ field: _.gt(0) }) + _.inc(-1)`
- 优先扣免费，再扣付费

### 2.3 records（占卜记录集合）

```json
{
  "_id": "自动生成",
  "_openid": "微信 openid",
  "question_category": "love",
  "question_text": "我们的感情会如何发展？",
  "spread_type": "single",
  "cards": [
    {
      "card_id": "major_00",
      "position": 1,
      "position_name": "",
      "is_reversed": false
    }
  ],
  "status": "pending",
  "created_at": "serverDate"
}
```

**status 值**：`pending`（等待解读）→ `completed`（解读完成）/ `failed`（解读失败）

### 2.4 interpretations（AI 解读集合）

```json
{
  "_id": "自动生成",
  "record_id": "关联 records._id",
  "_openid": "微信 openid",
  "prompt_text": "完整 Prompt",
  "raw_content": "AI 原始输出",
  "filtered_content": "安全过滤后内容",
  "model": "claude",
  "status": "success",
  "latency_ms": 3500,
  "created_at": "serverDate"
}
```

**model 值**：`claude` / `gpt` / `fallback`（预设模板）

### 2.5 orders（订单集合）

```json
{
  "_id": "自动生成（作为 outTradeNo）",
  "_openid": "微信 openid",
  "package_id": "mix_10",
  "amount": 2980,
  "status": "pending",
  "created_at": "serverDate"
}
```

**status 值**：`pending` → `paid`

### 2.6 cards（牌义数据）

```json
{
  "_id": "自动生成",
  "card_id": "major_00",
  "name_cn": "愚人",
  "name_en": "The Fool",
  "arcana_type": "major",
  "suit": null,
  "number": 0,
  "image_url": "major_00.svg",
  "sort_order": 0,
  "upright_keywords": "新开始,冒险,自由",
  "reversed_keywords": "鲁莽,不稳定,逃避",
  "upright_meaning": "正位含义...",
  "reversed_meaning": "逆位含义..."
}
```

**数据来源**：`cloud/database/cards.json` 种子数据，78 张牌（22 大 + 56 小）。

### 2.7 interpretation_cache（解读缓存）

```json
{
  "_id": "自动生成",
  "cache_key": "openid_category_cards",
  "result_data": { "content": "...", "model": "claude", "status": "success" },
  "created_at": "serverDate"
}
```

**TTL**：5 分钟，过期由云函数读取时判断并清理。

---

## 3. 数据关系

```
users (1) ←──→ (1) quotas
   │
   │ _openid
   ↓
records (N) ←──→ (1) interpretations
   │                    │
   │ _openid            │ record_id
   ↓                    │
orders (N)         interpretation_cache
```

**关联方式**：通过 `_openid`（用户维度）或 `record_id`（记录维度）关联，无外键约束。

---

## 4. 种子数据

### 牌义数据初始化

1. 数据存储在 `cloud/database/cards.json`（78 张牌）
2. 微信云开发控制台 → 数据库 → 创建 `cards` 集合
3. 导入 `cards.json` 数据
4. 牌面图片路径：`image_url` 字段指向 `client/src/assets/images/cards/` 下的 SVG 文件

### 套餐数据

套餐定义硬编码在 `cloud/functions/order/index.js` 中：

| ID | 名称 | 价格（分） | 单牌次数 | 三牌次数 |
|----|------|-----------|---------|---------|
| single_5 | 单牌 5 次 | 980 | 5 | 0 |
| three_5 | 三牌阵 5 次 | 1980 | 0 | 5 |
| mix_10 | 混合 10 次 | 2980 | 5 | 5 |

---

## 5. 查询优化建议

- **_openid 索引**：所有按用户查询的集合（users/quotas/records/orders），云数据库自动为 `_openid` 建立索引
- **record_id 索引**：interpretations 集合按 `record_id` 查询，建议手动创建索引
- **cache_key 索引**：interpretation_cache 集合按 `cache_key` 查询，建议手动创建索引
- **批量查询**：使用 `db.command.in()` 替代逐条查询（如牌义批量查询）
