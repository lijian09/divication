import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect } from 'react'

import StarBackground from '@components/StarBackground'
import QuotaBadge from '@components/QuotaBadge'
import DisclaimerModal from '@components/DisclaimerModal'
import PayWallModal from '@components/PayWallModal'
import { useQuotaStore, useUserStore } from '@store/index'
import { acceptAgreement } from '@/services/auth'
import { ROUTES, CATEGORIES } from '@utils/constants'

import './index.scss'

const HomePage: FC = () => {
  const { freeSingleRemaining, freeThreeRemaining, paidSingleRemaining, paidThreeRemaining } = useQuotaStore()
  const { userInfo, setAgreementAccepted } = useUserStore()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showPayWall, setShowPayWall] = useState(false)

  useEffect(() => {
    if (userInfo && !userInfo.agreementAccepted) {
      setShowDisclaimer(true)
    }
  }, [userInfo])

  const handleAgree = async () => {
    try {
      await acceptAgreement('1.0')
      setAgreementAccepted()
      setShowDisclaimer(false)
    } catch (error: any) {
      console.error('[DEBUG] 免责协议确认失败:', error.message)
      setShowDisclaimer(false)
    }
  }

  const handleDisagree = () => {
    setShowDisclaimer(false)
    Taro.showToast({ title: '需同意协议才可使用', icon: 'none' })
  }

  const handleStart = () => {
    const totalQuota = freeSingleRemaining + freeThreeRemaining + paidSingleRemaining + paidThreeRemaining
    if (totalQuota <= 0) {
      setShowPayWall(true)
      return
    }
    Taro.navigateTo({ url: ROUTES.QUESTION_SELECT })
  }

  const handlePurchase = (packageId: string) => {
    setShowPayWall(false)
    Taro.navigateTo({ url: `${ROUTES.PACKAGES}?selected=${packageId}` })
  }

  const handleCategoryClick = (categoryKey: string) => {
    Taro.navigateTo({
      url: `${ROUTES.QUESTION_SELECT}?category=${categoryKey}`,
    })
  }

  const totalQuota = freeSingleRemaining + freeThreeRemaining + paidSingleRemaining + paidThreeRemaining

  return (
    <View className="home-page">
      <StarBackground />

      <ScrollView className="home-page__scroll" scrollY>
        {/* 品牌区 — 双星装饰 + 渐变品牌名 + Slogan */}
        <View className="home-page__brand">
          <View className="home-page__brand-stars">
            <Text className="home-page__brand-star">✦</Text>
            <Text className="home-page__brand-star home-page__brand-star--right">✦</Text>
          </View>
          <Text className="home-page__brand-name">灵 谕</Text>
          <Text className="home-page__brand-slogan">用严谨的占星逻辑，为你抽一张牌</Text>
        </View>

        {/* 今日运势卡片 — 左侧牌面缩略图 + 右侧内容 */}
        <View className="home-page__fortune">
          <Text className="home-page__fortune-title">☽ 今日运势</Text>
          <View className="home-page__fortune-card">
            <View className="home-page__fortune-thumbnail">
              <Text className="home-page__fortune-thumbnail-icon">✦</Text>
            </View>
            <View className="home-page__fortune-content">
              <Text className="home-page__fortune-name">愚人 · 正位</Text>
              <Text className="home-page__fortune-summary">
                抽一张牌，探索今日运势走向，让塔罗为你揭示隐藏的机遇与指引
              </Text>
              <Text className="home-page__fortune-link">查看详情 &gt;</Text>
            </View>
          </View>
        </View>

        {/* 快捷分类入口 — 横向滚动 */}
        <ScrollView className="home-page__categories" scrollX>
          {CATEGORIES.slice(0, 3).map((cat) => (
            <View
              key={cat.key}
              className="home-page__category-item"
              onClick={() => handleCategoryClick(cat.key)}
            >
              <Text className="home-page__category-icon">{cat.icon}</Text>
              <Text className="home-page__category-label">{cat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 次数提示 */}
        <QuotaBadge
          singleCount={freeSingleRemaining + paidSingleRemaining}
          threeCount={freeThreeRemaining + paidThreeRemaining}
          isExhausted={totalQuota <= 0}
        />

        {/* CTA 按钮 — 星形装饰 + 渐变按钮 */}
        <View className="home-page__cta-wrapper">
          <View className="home-page__cta-stars">
            <Text className="home-page__cta-star">✦</Text>
            <Text className="home-page__cta-star home-page__cta-star--mid">✦</Text>
            <Text className="home-page__cta-star">✦</Text>
          </View>
          <View className="home-page__cta" onClick={handleStart}>
            <Text className="home-page__cta-text">✦ 开 始 占 卜 ✦</Text>
          </View>
        </View>

        {/* 底部免责 */}
        <Text className="home-page__disclaimer">· 仅供娱乐参考 ·</Text>
      </ScrollView>

      <DisclaimerModal
        visible={showDisclaimer}
        onAgree={handleAgree}
        onDisagree={handleDisagree}
      />

      <PayWallModal
        visible={showPayWall}
        onPurchase={handlePurchase}
        onClose={() => setShowPayWall(false)}
      />
    </View>
  )
}

export default HomePage
