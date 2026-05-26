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
      throw new Error(result.message || '请求失败')
    }

    return result.data as T
  } catch (err: any) {
    console.error(`[cloud] ${name} 调用失败:`, err.message)
    throw err
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
