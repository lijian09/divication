import http from './http'

/**
 * 占卜相关 API
 */

/** 抽牌参数 */
interface DrawParams {
  question_category: string
  question_text: string
  spread_type: 'single' | 'three'
}

/** 抽牌结果 */
interface DrawResult {
  sessionId: string
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

/** 历史记录列表 */
interface HistoryListParams {
  page: number
  pageSize: number
}

/**
 * 抽牌（检查配额 + Fisher-Yates 洗牌 + 正逆位）
 */
export async function drawCards(params: DrawParams): Promise<DrawResult> {
  const result = await http.post<DrawResult>('/api/divination/draw', params)
  return result.data
}

/**
 * 获取历史记录列表
 */
export async function getHistoryList(params: HistoryListParams) {
  const result = await http.get('/api/divination/records', params)
  return result.data
}

/**
 * 获取历史记录详情
 */
export async function getHistoryDetail(recordId: string) {
  const result = await http.get(`/api/divination/records/${recordId}`)
  return result.data
}
