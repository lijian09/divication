import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { initCloud } from './services/cloud'
import { wxLogin } from './services/auth'
import { useUserStore } from './store/userStore'
import { useQuotaStore } from './store/quotaStore'

import './app.scss'

/**
 * 应用入口组件 — F-509/F-510 性能优化
 * 关键路径：云初始化 → 登录 → 配额
 * 性能检测在各组件内部按需调用
 */
class App extends Component<PropsWithChildren> {
  componentDidMount() {
    this.initApp()
  }

  componentDidShow() {}
  componentDidHide() {}

  onError(error: string) {
    console.error('[App] error:', error)
  }

  async initApp() {
    const startTime = Date.now()

    try {
      const cloudReady = initCloud()
      if (!cloudReady) {
        console.error('[App] 云开发初始化失败')
        return
      }

      const loginData = await wxLogin()

      const { setLogin } = useUserStore.getState()
      setLogin(loginData.token, '', {
        userId: loginData.userInfo.id,
        nickname: loginData.userInfo.nickname,
        avatarUrl: loginData.userInfo.avatar_url || '',
        isNewUser: loginData.userInfo.isNewUser,
        agreementAccepted: loginData.userInfo.agreement_accepted,
      })

      const { fetchQuota } = useQuotaStore.getState()
      await fetchQuota()

      const elapsed = Date.now() - startTime
      if (elapsed > 2000) {
        console.warn(`[App] 初始化耗时 ${elapsed}ms，超过 2s 阈值`)
      }
    } catch (error: any) {
      console.error('[App] 初始化失败:', error.message)
    }
  }

  render() {
    return this.props.children
  }
}

export default App
