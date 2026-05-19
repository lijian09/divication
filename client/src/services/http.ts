import Taro from '@tarojs/taro'
import { getToken, getRefreshToken, setToken } from '@utils/auth'

/**
 * API 基础地址
 */
const BASE_URL = process.env.TARO_APP_API_BASE_URL || 'https://api.lingyu.com'

/**
 * 请求超时时间（毫秒）
 */
const TIMEOUT = 15000

/**
 * 封装 Taro.request
 * 统一注入 token、错误处理、无感刷新
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 发起请求
 */
async function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  const token = getToken()
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  }

  // 注入 Token
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout || TIMEOUT,
    })

    const result = response.data as ApiResponse<T>

    // 401 无感刷新
    if (result.code === 401) {
      const refreshed = await refreshToken()
      if (refreshed) {
        // 重试原请求
        return request(options)
      }
      // 刷新失败，跳转登录
      Taro.navigateTo({ url: '/pages/home/index' })
      throw new Error('登录已过期，请重新登录')
    }

    if (result.code !== 200) {
      throw new Error(result.message || '请求失败')
    }

    return result
  } catch (error: any) {
    console.error('[DEBUG] HTTP Error:', error.message, 'URL:', options.url)
    throw error
  }
}

/**
 * Token 刷新
 */
async function refreshToken(): Promise<boolean> {
  try {
    const refreshTokenValue = getRefreshToken()
    if (!refreshTokenValue) return false

    const response = await Taro.request({
      url: `${BASE_URL}/api/auth/refresh`,
      method: 'POST',
      data: { refreshToken: refreshTokenValue },
      header: { 'Content-Type': 'application/json' },
    })

    const result = response.data as ApiResponse<{ token: string; refreshToken: string }>
    if (result.code === 200) {
      setToken(result.data.token, result.data.refreshToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * HTTP 方法快捷调用
 */
export const http = {
  get: <T = any>(url: string, params?: any) =>
    request<T>({ url, method: 'GET', data: params }),

  post: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'POST', data }),

  put: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'PUT', data }),

  delete: <T = any>(url: string, data?: any) =>
    request<T>({ url, method: 'DELETE', data }),
}

export default http
