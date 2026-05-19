import { SetMetadata } from '@nestjs/common';

// ========== 角色相关 ==========
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ========== 公开接口（不需要鉴权） ==========
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ========== Redis Key 前缀 ==========
export const REDIS_KEYS = {
  SESSION: 'session:',         // 用户 Session
  REFRESH: 'refresh:',         // Refresh Token
  QUOTA: 'quota:',             // 用户配额
  CARDS_ALL: 'cards:all',      // 全量牌义缓存
  CARD: 'card:',               // 单张牌义缓存
  DRAW: 'draw:',               // 抽牌 Session
  AI_CACHE: 'ai:cache:',       // AI 解读缓存
  RATE_LIMIT: 'ratelimit:',    // 限流计数
  BLACKLIST: 'blacklist:',     // Token 黑名单
} as const;

// ========== 问题类别 ==========
export const QUESTION_CATEGORIES = {
  LOVE: 'love',
  CAREER: 'career',
  FINANCE: 'finance',
  HEALTH: 'health',
  GENERAL: 'general',
} as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[keyof typeof QUESTION_CATEGORIES];

// ========== 牌阵类型 ==========
export const SPREAD_TYPES = {
  SINGLE: 'single',
  THREE: 'three',
} as const;

export type SpreadType = (typeof SPREAD_TYPES)[keyof typeof SPREAD_TYPES];

// ========== 订单状态 ==========
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// ========== AI 解读状态 ==========
export const AI_INTERPRETATION_STATUS = {
  SUCCESS: 'success',
  FILTERED: 'filtered',
  FALLBACK: 'fallback',
  ERROR: 'error',
} as const;

// ========== 占卜记录状态 ==========
export const DIVINATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// ========== 用户状态 ==========
export const USER_STATUS = {
  NORMAL: 1,
  DISABLED: 0,
  DELETED: -1,
} as const;
