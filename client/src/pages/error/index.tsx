import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'

import './index.scss'

/**
 * 错误页（全局兜底）
 * 网络错误 / 服务异常兜底展示
 */

interface ErrorPageProps {
  /** 错误类型 */
  type?: 'network' | 'server' | 'timeout' | 'auth'
}

/** 错误类型配置 */
const ERROR_CONFIG: Record<string, { title: string; desc: string; icon: string }> = {
  network: { title: '网络连接异常', desc: '请检查你的网络设置，稍后再试', icon: '📡' },
  server: { title: '服务暂时不可用', desc: '系统正在努力恢复中，请稍后再试', icon: '🖥️' },
  timeout: { title: '请求超时', desc: '网络较慢，请重试', icon: '⏰' },
  auth: { title: '登录异常', desc: '请重新授权登录', icon: '🔑' },
}

const ErrorPage: FC<ErrorPageProps> = ({ type = 'network' }) => {
  const config = ERROR_CONFIG[type] || ERROR_CONFIG.network

  const handleRetry = () => {
    // TODO: 重试逻辑
    Taro.navigateBack()
  }

  return (
    <View className="error-page">
      <StarBackground />

      <View className="error-page__nav">
        <Text
          className="error-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
      </View>

      <View className="error-page__content">
        {/* 错误插画占位 */}
        <View className="error-page__icon">
          <Text className="error-page__icon-text">{config.icon}</Text>
        </View>

        <Text className="error-page__title">{config.title}</Text>
        <Text className="error-page__desc">{config.desc}</Text>

        <View className="error-page__retry" onClick={handleRetry}>
          <Text className="error-page__retry-text">重新加载</Text>
        </View>

        <Text className="error-page__back" onClick={() => Taro.navigateBack()}>
          返回上一页
        </Text>
      </View>
    </View>
  )
}

export default ErrorPage
