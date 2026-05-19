import http from './http'

/**
 * 配额相关 API
 */

/** 配额信息 */
interface QuotaInfo {
  freeSingleRemaining: number
  freeThreeRemaining: number
  paidSingleRemaining: number
  paidThreeRemaining: number
  nextFreeResetTime: string
}

/**
 * 获取用户配额信息
 */
export async function getQuotaInfo() {
  const result = await http.get<QuotaInfo>('/api/quota')
  return result.data
}
