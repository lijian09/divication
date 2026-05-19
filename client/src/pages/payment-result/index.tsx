import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 支付结果页
 * 展示微信支付结果（成功/失败）
 */
const PaymentResultPage: FC = () => {
  // TODO: 从路由参数获取支付结果
  const isSuccess = true

  const handleGoHome = () => {
    Taro.switchTab({ url: ROUTES.HOME })
  }

  const handleRetry = () => {
    Taro.navigateBack()
  }

  return (
    <View className="payment-result-page">
      <StarBackground />

      {isSuccess ? (
        /* 成功状态 */
        <View className="payment-result-page__success">
          <View className="payment-result-page__icon payment-result-page__icon--success">
            <Text className="payment-result-page__icon-text">✓</Text>
          </View>
          <Text className="payment-result-page__title">购买成功！</Text>

          <View className="payment-result-page__summary">
            <Text className="payment-result-page__summary-item">套餐：知心包</Text>
            <Text className="payment-result-page__summary-item">金额：¥19.9</Text>
            <Text className="payment-result-page__summary-item">单牌 +15 次</Text>
            <Text className="payment-result-page__summary-item">三牌 +8 次</Text>
          </View>

          <Text className="payment-result-page__hint">额度已到账，可立即使用</Text>

          <View className="payment-result-page__cta" onClick={handleGoHome}>
            <Text className="payment-result-page__cta-text">开始占卜 ✦</Text>
          </View>
          <Text className="payment-result-page__back" onClick={handleGoHome}>
            返回
          </Text>
        </View>
      ) : (
        /* 失败状态 */
        <View className="payment-result-page__fail">
          <View className="payment-result-page__icon payment-result-page__icon--fail">
            <Text className="payment-result-page__icon-text">✕</Text>
          </View>
          <Text className="payment-result-page__title">支付未完成</Text>
          <Text className="payment-result-page__hint">
            你的支付未完成或已取消，未产生任何扣款。
          </Text>

          <View className="payment-result-page__cta" onClick={handleRetry}>
            <Text className="payment-result-page__cta-text">重新购买</Text>
          </View>
          <Text className="payment-result-page__back" onClick={handleGoHome}>
            返回首页
          </Text>
        </View>
      )}
    </View>
  )
}

export default PaymentResultPage
