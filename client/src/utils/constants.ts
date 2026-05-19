/**
 * 常量定义
 * 业务常量、路由路径、配置项
 */

// ==================== 路由路径 ====================

export const ROUTES = {
  HOME: '/pages/home/index',
  ONBOARDING: '/pages/onboarding/index',
  QUESTION_SELECT: '/pages/question-select/index',
  SPREAD_SELECT: '/pages/spread-select/index',
  SHUFFLE: '/pages/shuffle/index',
  PICK_CARD: '/pages/pick-card/index',
  REVEAL: '/pages/reveal/index',
  RESULT_SINGLE: '/pages/result-single/index',
  RESULT_THREE: '/pages/result-three/index',
  PROFILE: '/pages/profile/index',
  HISTORY_LIST: '/pages/history-list/index',
  HISTORY_DETAIL: '/pages/history-detail/index',
  PACKAGES: '/pages/packages/index',
  PAYMENT_RESULT: '/pages/payment-result/index',
  SETTINGS: '/pages/settings/index',
  LOADING: '/pages/loading/index',
  ERROR: '/pages/error/index',
} as const

// ==================== 问题分类 ====================

export const CATEGORIES = [
  { key: 'love', label: '爱情', icon: '♡', color: '#E57373' },
  { key: 'career', label: '事业', icon: '★', color: '#4FC3F7' },
  { key: 'finance', label: '财运', icon: '♛', color: '#FFD54F' },
  { key: 'health', label: '健康', icon: '☘', color: '#81C784' },
  { key: 'general', label: '综合', icon: '◈', color: '#BA68C8' },
] as const

// ==================== 预设问题 ====================

export const PRESET_QUESTIONS: Record<string, string[]> = {
  love: [
    '我们的感情会如何发展？',
    '对方现在对我是什么感觉？',
    '我该不该主动表白？',
  ],
  career: [
    '我适合现在换工作吗？',
    '这份工作的发展前景如何？',
    '我应该选择哪个方向发展？',
  ],
  finance: [
    '我的财运走势如何？',
    '最近适合投资吗？',
    '我该如何提升收入？',
  ],
  health: [
    '我的身体状态需要注意什么？',
    '最近的健康运势如何？',
  ],
  general: [
    '我最近的整体运势如何？',
    '我应该注意哪些方面？',
    '接下来的机会在哪里？',
  ],
}

// ==================== 牌阵类型 ====================

export const SPREAD_TYPES = {
  SINGLE: 'single',
  THREE: 'three',
} as const

// ==================== 分页 ====================

export const PAGE_SIZE = 20

// ==================== 分享默认配置 ====================

export const SHARE_TITLE = '灵谕 - AI 塔罗牌解读'
