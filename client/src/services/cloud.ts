import Taro from '@tarojs/taro'

/**
 * 云函数调用封装
 * 替代原来的 HTTP 请求
 */

interface CloudCallResult<T = any> {
  code: number
  message?: string
  data?: T
}

/** 错误类型 */
export enum CloudErrorType {
  /** 网络断开 */
  NETWORK = 'network',
  /** 超时 */
  TIMEOUT = 'timeout',
  /** 业务错误（云函数返回 code !== 0） */
  BUSINESS = 'business',
  /** 未知错误 */
  UNKNOWN = 'unknown',
}

/** 云函数调用错误 */
export class CloudError extends Error {
  type: CloudErrorType
  constructor(message: string, type: CloudErrorType) {
    super(message)
    this.type = type
    this.name = 'CloudError'
  }
}

/**
 * 调用云函数
 */
export async function callFunction<T = any>(
  name: string,
  data: Record<string, any> = {},
): Promise<T> {
  try {
    const res = await Taro.cloud.callFunction({
      name,
      data,
    })

    const result = res.result as CloudCallResult<T>

    if (result.code !== 0) {
      throw new CloudError(result.message || '请求失败', CloudErrorType.BUSINESS)
    }

    return result.data as T
  } catch (err: any) {
    // 网络断开
    if (err.errCode === -1 || err.message?.includes('网络')) {
      console.error(`[cloud] ${name} 网络错误:`, err.message)
      throw new CloudError('网络连接失败，请检查网络设置', CloudErrorType.NETWORK)
    }

    // 超时
    if (err.message?.includes('timeout') || err.message?.includes('超时')) {
      console.error(`[cloud] ${name} 超时:`, err.message)
      throw new CloudError('请求超时，请稍后重试', CloudErrorType.TIMEOUT)
    }

    // 已经是 CloudError（业务错误）
    if (err instanceof CloudError) {
      throw err
    }

    console.error(`[cloud] ${name} 调用失败:`, err.message)
    throw new CloudError(err.message || '未知错误', CloudErrorType.UNKNOWN)
  }
}

/**
 * 初始化云开发环境
 */
export function initCloud() {
  if (!Taro.cloud) {
    console.warn('[cloud] 当前环境不支持云开发')
    return false
  }

  Taro.cloud.init({
    env: Taro.cloud.DYNAMIC_CURRENT_ENV,
    traceUser: true,
  })

  return true
}
