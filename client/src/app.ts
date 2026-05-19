import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'

import './app.scss'

/**
 * 应用入口组件
 * 负责全局生命周期管理
 */
class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('[DEBUG] App mounted')
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

  render() {
    return this.props.children
  }
}

export default App
