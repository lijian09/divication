import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import QuotaBadge from '@components/QuotaBadge'
import { useQuotaStore } from '@store/index'
import { ROUTES, CATEGORIES } from '@utils/constants'

import './index.scss'

/**
 * 首页
 * 品牌展示入口，引导用户开始占卜，展示今日运势
 * TabBar 第一个页面
 */
const HomePage: FC = () => {
  const { freeSingleRemaining, freeThreeRemaining } = useQuotaStore()

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
    </View>
  )
}

export default HomePage
