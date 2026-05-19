import { create } from 'zustand'
import { getQuotaInfo } from '@/services/quota'

/**
 * 配额状态管理
 * 管理用户剩余占卜次数
 */
interface QuotaState {
  /** 单牌剩余免费次数 */
  freeSingleRemaining: number
  /** 三牌剩余免费次数 */
  freeThreeRemaining: number
  /** 单牌付费次数 */
  paidSingleRemaining: number
  /** 三牌付费次数 */
  paidThreeRemaining: number
  /** 是否正在加载 */
  loading: boolean

  /** 从后端拉取配额 */
  fetchQuota: () => Promise<void>
  /** 设置配额信息 */
  setQuota: (quota: {
    freeSingle: number
    freeThree: number
    paidSingle: number
    paidThree: number
  }) => void
  /** 消耗单牌次数 */
  consumeSingle: () => void
  /** 消耗三牌次数 */
  consumeThree: () => void
  /** 获取总单牌次数 */
  getTotalSingle: () => number
  /** 获取总三牌次数 */
  getTotalThree: () => number
}

export const useQuotaStore = create<QuotaState>((set, get) => ({
  freeSingleRemaining: 0,
  freeThreeRemaining: 0,
  paidSingleRemaining: 0,
  paidThreeRemaining: 0,
  loading: false,

  fetchQuota: async () => {
    set({ loading: true })
    try {
      const data = await getQuotaInfo()
      set({
        freeSingleRemaining: data.free_single_remaining,
        freeThreeRemaining: data.free_three_remaining,
        paidSingleRemaining: data.paid_single_remaining,
        paidThreeRemaining: data.paid_three_remaining,
        loading: false,
      })
      console.log('[DEBUG] 配额拉取成功:', data)
    } catch (error: any) {
      console.error('[DEBUG] 配额拉取失败:', error.message)
      set({ loading: false })
    }
  },

  setQuota: (quota) =>
    set({
      freeSingleRemaining: quota.freeSingle,
      freeThreeRemaining: quota.freeThree,
      paidSingleRemaining: quota.paidSingle,
      paidThreeRemaining: quota.paidThree,
    }),

  consumeSingle: () =>
    set((state) => {
      if (state.freeSingleRemaining > 0) {
        return { freeSingleRemaining: state.freeSingleRemaining - 1 }
      }
      return { paidSingleRemaining: state.paidSingleRemaining - 1 }
    }),

  consumeThree: () =>
    set((state) => {
      if (state.freeThreeRemaining > 0) {
        return { freeThreeRemaining: state.freeThreeRemaining - 1 }
      }
      return { paidThreeRemaining: state.paidThreeRemaining - 1 }
    }),

  getTotalSingle: () => {
    const state = get()
    return state.freeSingleRemaining + state.paidSingleRemaining
  },

  getTotalThree: () => {
    const state = get()
    return state.freeThreeRemaining + state.paidThreeRemaining
  },
}))
