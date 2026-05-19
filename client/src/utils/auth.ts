import Taro from '@tarojs/taro'

/**
 * Token 管理工具
 * 本地存储 Token 的读写删
 */

const TOKEN_KEY = 'lingyu_token'
const REFRESH_TOKEN_KEY = 'lingyu_refresh_token'

/**
 * 获取 Access Token
 */
export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null
}

/**
 * 获取 Refresh Token
 */
export function getRefreshToken(): string | null {
  return Taro.getStorageSync(REFRESH_TOKEN_KEY) || null
}

/**
 * 存储 Token
 */
export function setToken(token: string, refreshToken: string): void {
  Taro.setStorageSync(TOKEN_KEY, token)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * 检查是否已登录（Token 是否存在）
 */
export function hasToken(): boolean {
  return !!getToken()
}
