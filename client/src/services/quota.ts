import { callFunction } from './cloud'

/**
 * 配额相关 API
 * 通过云函数实现
 */

/** 配额信息 */
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
  return callFunction<QuotaResponse>('quota', {
    action: 'getQuota',
  })
}
