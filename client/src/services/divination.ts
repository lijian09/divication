import { callFunction } from './cloud'

/**
 * 占卜相关 API
 * 通过云函数实现
 */

/** 抽牌参数 */
interface DrawParams {
  question_category: string
  question_text: string
  spread_type: 'single' | 'three'
}

/** 抽牌结果 */
interface DrawResult {
  recordId: string
  spread_type: string
  cards: Array<{
    id: string
    name: string
    nameEn: string
    position: number
    positionName: string
    isReversed: boolean
    keywords: string
    imageUrl: string
  }>
  quotaType: string
}

/** AI 解读参数 */
interface InterpretParams {
  recordId: string
  questionCategory: string
  questionText: string
  spreadType: 'single' | 'three'
  cards: Array<{
    card_id: string
    position: number
    is_reversed: boolean
  }>
}

/** AI 解读结果 */
interface InterpretResult {
  content: string
  cardNames: string[]
  model: string
  status: string
}

/**
 * 抽牌（检查配额 + Fisher-Yates 洗牌 + 正逆位）
 */
export async function drawCards(params: DrawParams): Promise<DrawResult> {
  return callFunction<DrawResult>('divination', {
    action: 'draw',
    spreadType: params.spread_type,
    questionCategory: params.question_category,
    questionText: params.question_text,
  })
}

/**
 * 请求 AI 解读
 */
export async function interpretDivination(params: InterpretParams): Promise<InterpretResult> {
  return callFunction<InterpretResult>('ai-interpret', {
    action: 'interpret',
    ...params,
  })
}

/**
 * 获取历史记录列表
 */
export async function getHistoryList(params: { page: number; pageSize: number }) {
  return callFunction('divination', {
    action: 'getHistory',
    ...params,
  })
}

/**
 * 获取历史记录详情
 */
export async function getHistoryDetail(recordId: string) {
  return callFunction('divination', {
    action: 'getDetail',
    recordId,
  })
}
