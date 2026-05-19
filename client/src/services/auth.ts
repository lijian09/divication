import Taro from '@tarojs/taro'
import http from './http'

/**
 * 登录相关 API
 */

/** 微信登录请求参数 */
interface WxLoginParams {
  code: string
}

/** 登录响应 */
interface LoginResponse {
  token: string
  refreshToken: string
  userInfo: {
    userId: string
    nickname: string
    avatarUrl: string
    isNewUser: boolean
    agreementAccepted: boolean
  }
}

/**
 * 微信登录
 * 调用 wx.login() 获取 code，发送到后端换取 token
 */
export async function wxLogin(): Promise<LoginResponse> {
  // 获取微信登录 code
  const loginRes = await Taro.login()
  if (!loginRes.code) {
    throw new Error('获取微信登录凭证失败')
  }

  console.log('[DEBUG] wx.login code:', loginRes.code)

  const result = await http.post<LoginResponse>('/api/auth/wx-login', {
    code: loginRes.code,
  })

  return result.data
}

/**
 * 刷新 Token
 */
export async function refreshTokenApi(refreshToken: string) {
  const result = await http.post('/api/auth/refresh', { refreshToken })
  return result.data
}

/**
 * 注销账号
 */
export async function deleteAccount() {
  const result = await http.delete('/api/auth/account')
  return result.data
}
