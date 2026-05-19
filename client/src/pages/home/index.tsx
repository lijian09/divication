import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect } from 'react'

import StarBackground from '@components/StarBackground'
import QuotaBadge from '@components/QuotaBadge'
import DisclaimerModal from '@components/DisclaimerModal'
import { useQuotaStore, useUserStore } from '@store/index'
import { acceptAgreement } from '@/services/auth'
import { ROUTES, CATEGORIES } from '@utils/constants'

import './index.scss'

/**
 * 首页
 * 品牌展示入口，引导用户开始占卜，展示今日运势
 * TabBar 第一个页面
 */
const HomePage: FC = () => {
  const { freeSingleRemaining, freeThreeRemaining } = useQuotaStore()
  const { userInfo, setAgreementAccepted } = useUserStore()
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  /** 检查是否需要展示免责弹窗 */
  useEffect(() => {
    if (userInfo && !userInfo.agreementAccepted) {
      setShowDisclaimer(true)
    }
  }, [userInfo])

  /** 同意免责协议 */
  const handleAgree = async () => {
    try {
      await acceptAgreement('1.0')
      setAgreementAccepted()
      setShowDisclaimer(false)
      console.log('[DEBUG] 免责协议确认成功')
    } catch (error: any) {
      console.error('[DEBUG] 免责协议确认失败:', error.message)
      // 即使接口失败也允许使用，下次再提示
      setShowDisclaimer(false)
    }
  }

  /** 不同意免责协议 */
  const handleDisagree = () => {
    setShowDisclaimer(false)
    Taro.showToast({ title: '需同意协议才可使用', icon: 'none' })
  }

  /** 点击"开始占卜" */
  const handleStart = () => {
    const totalSingle = freeSingleRemaining + freeThreeRemaining
    if (totalSingle <= 0) {
      // TODO: 弹出付费引导
      return
    }
    Taro.navigateTo({ url: ROUTES.QUESTION_SELECT })
  }

  /** 点击快捷分类 */
  const handleCategoryClick = (categoryKey: string) => {
    Taro.navigateTo({
      url: `${ROUTES.QUESTION_SELECT}?category=${categoryKey}`,
    })
  }

  return (
    <View className="home-page">
      <StarBackground />

      <ScrollView className="home-page__scroll" scrollY>
        {/* 品牌 Logo 区域 */}
        <View className="home-page__brand">
          <Text className="home-page__brand-icon">✦</Text>
          <Text className="home-page__brand-name">灵 谕</Text>
          <Text className="home-page__brand-slogan">用严谨的占星逻辑，为你抽一张牌</Text>
        </View>

        {/* 今日运势卡片 */}
        <View className="home-page__fortune">
          <Text className="home-page__fortune-title">☽ 今日运势</Text>
          <View className="home-page__fortune-card">
            <View className="home-page__fortune-placeholder">
              <Text className="home-page__fortune-text">抽一张牌，开启今日运势</Text>
            </View>
            <Text className="home-page__fortune-link">查看详情 ></Text>
          </View>
        </View>

        {/* 快捷分类入口 */}
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
          singleCount={freeSingleRemaining}
          threeCount={freeThreeRemaining}
          isExhausted={freeSingleRemaining + freeThreeRemaining <= 0}
        />

        {/* 开始占卜按钮 */}
        <View className="home-page__cta" onClick={handleStart}>
          <Text className="home-page__cta-text">✦ 开 始 占 卜 ✦</Text>
        </View>

        {/* 底部免责 */}
        <Text className="home-page__disclaimer">· 仅供娱乐参考 ·</Text>
      </ScrollView>

      {/* 免责协议弹窗 */}
      <DisclaimerModal
        visible={showDisclaimer}
        onAgree={handleAgree}
        onDisagree={handleDisagree}
      />
    </View>
  )
}

export default HomePage
