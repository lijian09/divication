import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 支付结果页
 * 展示微信支付结果（成功/失败）
 * 从路由参数获取支付结果
 */
const PaymentResultPage: FC = () => {
  const router = useRouter()
  const isSuccess = router.params.success === 'true'
  const pkgName = decodeURIComponent(router.params.pkgName || '')
  const amount = Number(router.params.amount || 0)
  const singleCount = Number(router.params.single || 0)
  const threeCount = Number(router.params.three || 0)

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
            <Text className="payment-result-page__icon-text">&#x2713;</Text>
          </View>
          <Text className="payment-result-page__title">购买成功！</Text>

          <View className="payment-result-page__summary">
            {pkgName && (
              <Text className="payment-result-page__summary-item">
                套餐：{pkgName}
              </Text>
            )}
            {amount > 0 && (
              <Text className="payment-result-page__summary-item">
                金额：&yen;{(amount / 100).toFixed(1)}
              </Text>
            )}
            {singleCount > 0 && (
              <Text className="payment-result-page__summary-item">
                单牌 +{singleCount} 次
              </Text>
            )}
            {threeCount > 0 && (
              <Text className="payment-result-page__summary-item">
                三牌 +{threeCount} 次
              </Text>
            )}
          </View>

          <Text className="payment-result-page__hint">额度已到账，可立即使用</Text>

          <View className="payment-result-page__cta" onClick={handleGoHome}>
            <Text className="payment-result-page__cta-text">开始占卜 &#10022;</Text>
          </View>
          <Text className="payment-result-page__back" onClick={handleGoHome}>
            返回首页
          </Text>
        </View>
      ) : (
        /* 失败状态 */
        <View className="payment-result-page__fail">
          <View className="payment-result-page__icon payment-result-page__icon--fail">
            <Text className="payment-result-page__icon-text">&#x2715;</Text>
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
