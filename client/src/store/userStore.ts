import { create } from 'zustand'

/**
 * 用户信息类型
 */
interface UserInfo {
  userId: string
  nickname: string
  avatarUrl: string
  isNewUser: boolean
  agreementAccepted: boolean
}

/**
 * 用户状态管理
 * 管理登录态、用户信息
 */
interface UserState {
  /** 是否已登录 */
  isLogin: boolean
  /** 用户信息 */
  userInfo: UserInfo | null
  /** openid（云函数用） */
  token: string | null

  /** 设置登录信息 */
  setLogin: (token: string, refreshToken: string, userInfo: UserInfo) => void
  /** 更新用户信息 */
  updateUserInfo: (info: Partial<UserInfo>) => void
  /** 登出 */
  logout: () => void
  /** 设置协议已同意 */
  setAgreementAccepted: () => void
}

export const useUserStore = create<UserState>((set) => ({
  isLogin: false,
  userInfo: null,
  token: null,

  setLogin: (token, _refreshToken, userInfo) =>
    set({ isLogin: true, token, userInfo }),

  updateUserInfo: (info) =>
    set((state) => ({
      userInfo: state.userInfo ? { ...state.userInfo, ...info } : null,
    })),

  logout: () =>
    set({ isLogin: false, userInfo: null, token: null }),

  setAgreementAccepted: () =>
    set((state) => ({
      userInfo: state.userInfo
        ? { ...state.userInfo, agreementAccepted: true }
        : null,
    })),
}))
