import { create } from 'zustand'

/**
 * UI 状态管理
 * 管理全局 Loading、弹窗状态
 */
interface UIState {
  /** 全局 Loading 状态 */
  globalLoading: boolean
  /** Loading 文案 */
  loadingText: string
  /** 免责协议弹窗是否显示 */
  showDisclaimer: boolean
  /** 付费引导弹窗是否显示 */
  showPaywall: boolean
  /** Toast 信息 */
  toast: { message: string; type: 'success' | 'error' | 'info' } | null

  /** 显示 Loading */
  showLoading: (text?: string) => void
  /** 隐藏 Loading */
  hideLoading: () => void
  /** 显示/隐藏免责协议 */
  toggleDisclaimer: (show: boolean) => void
  /** 显示/隐藏付费弹窗 */
  togglePaywall: (show: boolean) => void
  /** 显示 Toast */
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  /** 隐藏 Toast */
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  globalLoading: false,
  loadingText: '加载中...',
  showDisclaimer: false,
  showPaywall: false,
  toast: null,

  showLoading: (text = '加载中...') => set({ globalLoading: true, loadingText: text }),
  hideLoading: () => set({ globalLoading: false }),
  toggleDisclaimer: (show) => set({ showDisclaimer: show }),
  togglePaywall: (show) => set({ showPaywall: show }),
  showToast: (message, type = 'info') =>
    set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}))
