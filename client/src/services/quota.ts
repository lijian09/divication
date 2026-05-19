import http from './http'

/**
 * 配额相关 API
 */

/** 配额信息（后端返回 snake_case） */
interface QuotaResponse {
  free_single_remaining: number
  free_three_remaining: number
  paid_single_remaining: number
  paid_three_remaining: number
  free_reset_date: string
}

/**
 * 获取用户配额信息
 */
export async function getQuotaInfo(): Promise<QuotaResponse> {
  const result = await http.get<QuotaResponse>('/api/quota')
  return result.data
}
