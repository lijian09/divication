import Taro from '@tarojs/taro'
import { CloudError, CloudErrorType } from '@/services/cloud'
import { ROUTES } from './constants'

/**
 * 统一处理云函数错误
 * 根据错误类型跳转对应兜底页面或显示 Toast
 */
export function handleCloudError(err: unknown, fallbackMessage = '操作失败，请重试') {
  if (err instanceof CloudError) {
    switch (err.type) {
      case CloudErrorType.NETWORK:
        Taro.navigateTo({
          url: `${ROUTES.ERROR}?type=network`,
        })
        return

      case CloudErrorType.TIMEOUT:
        Taro.navigateTo({
          url: `${ROUTES.ERROR}?type=timeout`,
        })
        return

      case CloudErrorType.BUSINESS:
        Taro.showToast({ title: err.message || fallbackMessage, icon: 'none' })
        return

      case CloudErrorType.UNKNOWN:
      default:
        Taro.showToast({ title: fallbackMessage, icon: 'none' })
        return
    }
  }

  // 非 CloudError 的兜底
  Taro.showToast({ title: fallbackMessage, icon: 'none' })
}
