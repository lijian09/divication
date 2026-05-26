import Taro from '@tarojs/taro'
import { callFunction } from './cloud'

/**
 * 登录相关 API
 * 通过云函数实现
 */

/** 登录响应 */
interface LoginResponse {
  token: string
  userInfo: {
    id: string
    nickname: string
    avatar_url: string | null
    isNewUser: boolean
    agreement_accepted: boolean
  }
}

/**
 * 微信登录
 * 云函数直接获取 openid，无需传递 code
 */
export async function wxLogin(): Promise<LoginResponse> {
  const result = await callFunction<LoginResponse>('login', {
    action: 'login',
  })

  return result
}

/**
 * 确认免责协议
 */
export async function acceptAgreement(
  agreementVersion: string = 'v1.0',
): Promise<void> {
  await callFunction('login', {
    action: 'acceptAgreement',
    agreementVersion,
  })
}
