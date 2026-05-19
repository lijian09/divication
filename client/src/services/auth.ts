import Taro from '@tarojs/taro'
import http from './http'
import { setToken } from '@utils/auth'

/**
 * 登录相关 API
 */

/** 登录响应 */
interface LoginResponse {
  token: string
  refresh_token: string
  userInfo: {
    id: string
    nickname: string
    avatar_url: string | null
    agreement_accepted: boolean
  }
}

/** 确认协议响应 */
interface AcceptAgreementResponse {
  message: string
  agreement_accepted: boolean
  agreement_version: string
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

  // 登录成功，持久化 token
  setToken(result.data.token, result.data.refresh_token)

  return result.data
}

/**
 * 确认免责协议
 */
export async function acceptAgreement(
  agreementVersion: string = '1.0',
): Promise<AcceptAgreementResponse> {
  const result = await http.post<AcceptAgreementResponse>(
    '/api/auth/accept-agreement',
    { agreement_version: agreementVersion },
  )
  return result.data
}

/**
 * 刷新 Token
 */
export async function refreshTokenApi(refreshToken: string) {
  const result = await http.post('/api/auth/refresh', { refresh_token: refreshToken })
  return result.data
}

/**
 * 注销账号
 */
export async function deleteAccount() {
  const result = await http.delete('/api/auth/account')
  return result.data
}
