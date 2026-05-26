import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { initCloud } from './services/cloud'
import { wxLogin } from './services/auth'
import { useUserStore } from './store/userStore'
import { useQuotaStore } from './store/quotaStore'

import './app.scss'

/**
 * 应用入口组件
 * 负责全局生命周期管理：初始化云开发、自动登录、配额拉取
 */
class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('[DEBUG] App mounted')
    this.initApp()
  }

  componentDidShow() {
    console.log('[DEBUG] App show')
  }

  componentDidHide() {
    console.log('[DEBUG] App hide')
  }

  /** 全局错误捕获 */
  onError(error: string) {
    console.error('[DEBUG] App error:', error)
  }

  /**
   * 初始化应用
   * 1. 初始化云开发环境
   * 2. 自动登录
   * 3. 拉取配额
   */
  async initApp() {
    try {
      // 1. 初始化云开发
      const cloudReady = initCloud()
      if (!cloudReady) {
        console.error('[DEBUG] 云开发初始化失败')
        return
      }

      console.log('[DEBUG] 开始自动登录...')
      const loginData = await wxLogin()

      // 同步到 Zustand Store
      const { setLogin } = useUserStore.getState()
      setLogin(loginData.token, '', {
        userId: loginData.userInfo.id,
        nickname: loginData.userInfo.nickname,
        avatarUrl: loginData.userInfo.avatar_url || '',
        isNewUser: loginData.userInfo.isNewUser,
        agreementAccepted: loginData.userInfo.agreement_accepted,
      })

      console.log('[DEBUG] 自动登录成功，userId:', loginData.userInfo.id)

      // 登录成功后拉取配额
      const { fetchQuota } = useQuotaStore.getState()
      await fetchQuota()
    } catch (error: any) {
      console.error('[DEBUG] 自动登录失败:', error.message)
    }
  }

  render() {
    return this.props.children
  }
}

export default App
