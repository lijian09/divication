import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import AiLoading from '@components/AiLoading'

import './index.scss'

/**
 * 加载中页
 * AI 解读生成等待状态
 * 展示星星旋转 + 诗句轮播 + 进度条
 */
const LoadingPage: FC = () => {
  const handleCancel = () => {
    Taro.navigateBack()
  }

  return (
    <View className="loading-page">
      <StarBackground />

      <View className="loading-page__nav">
        <Text
          className="loading-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
        <Text className="loading-page__nav-title">解读生成中</Text>
        <View className="loading-page__nav-placeholder" />
      </View>

      <AiLoading onCancel={handleCancel} />
    </View>
  )
}

export default LoadingPage
