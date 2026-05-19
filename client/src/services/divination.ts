import http from './http'

/**
 * 占卜相关 API
 */

/** 开始占卜参数 */
interface StartDivinationParams {
  question: string
  category: string
  spreadType: 'single' | 'three'
}

/** 抽牌结果 */
interface DrawResult {
  sessionId: string
  cardCount: number
  cards: Array<{
    id: string
    position: number
    isUpright: boolean
  }>
}

/** 解读参数 */
interface InterpretParams {
  sessionId: string
  question: string
  cards: Array<{ id: string; name: string; isUpright: boolean; position?: string }>
  spreadType: 'single' | 'three'
}

/** 历史记录列表 */
interface HistoryListParams {
  page: number
  pageSize: number
}

/**
 * 开始占卜（检查配额 + 生成牌序）
 */
export async function startDivination(params: StartDivinationParams) {
  const result = await http.post<DrawResult>('/api/divination/start', params)
  return result.data
}

/**
 * 请求 AI 解读
 */
export async function interpretDivination(params: InterpretParams) {
  const result = await http.post('/api/divination/interpret', params)
  return result.data
}

/**
 * 保存占卜记录
 */
export async function saveDivinationRecord(sessionId: string) {
  const result = await http.post('/api/divination/save', { sessionId })
  return result.data
}

/**
 * 获取历史记录列表
 */
export async function getHistoryList(params: HistoryListParams) {
  const result = await http.get('/api/divination/history', params)
  return result.data
}

/**
 * 获取历史记录详情
 */
export async function getHistoryDetail(recordId: string) {
  const result = await http.get(`/api/divination/history/${recordId}`)
  return result.data
}
