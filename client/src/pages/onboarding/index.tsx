import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 引导页
 * 向新用户介绍产品核心功能和价值主张
 * 3 页轮播：选牌手 → 翻牌面 → 看解读
 */

const ONBOARDING_ITEMS = [
  {
    title: '遇见你的塔罗师',
    desc: '随时随地，抽一张牌，AI 为你解读当下的困惑',
  },
  {
    title: '沉浸式体验',
    desc: '手势洗牌、翻牌动画，感受命运的仪式感',
  },
  {
    title: '专业 AI 解读',
    desc: '基于占星逻辑的深度解读，温柔有力量',
  },
]

const OnboardingPage: FC = () => {
  const [current, setCurrent] = useState(0)
  const isLastPage = current === ONBOARDING_ITEMS.length - 1

  /** 跳过引导 */
  const handleSkip = () => {
    Taro.redirectTo({ url: ROUTES.HOME })
  }

  /** 下一步 / 开始使用 */
  const handleNext = () => {
    if (isLastPage) {
      Taro.redirectTo({ url: ROUTES.HOME })
    } else {
      setCurrent((prev) => prev + 1)
    }
  }

  /** 滑动切换 */
  const handleChange = (e: any) => {
    setCurrent(e.detail.current)
  }

  return (
    <View className="onboarding-page">
      {/* 跳过按钮 */}
      <Text className="onboarding-page__skip" onClick={handleSkip}>
        跳过 &gt;
      </Text>

      {/* 轮播 */}
      <Swiper
        className="onboarding-page__swiper"
        current={current}
        onChange={handleChange}
        indicatorDots={false}
        autoplay={false}
      >
        {ONBOARDING_ITEMS.map((item, index) => (
          <SwiperItem key={index}>
            <View className="onboarding-page__slide">
              {/* 插画占位 */}
              <View className="onboarding-page__illustration">
                <Text className="onboarding-page__illustration-icon">
                  {index === 0 ? '🃏' : index === 1 ? '✨' : '🔮'}
                </Text>
              </View>

              <Text className="onboarding-page__title">{item.title}</Text>
              <Text className="onboarding-page__desc">{item.desc}</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      {/* 页码指示器 */}
      <View className="onboarding-page__dots">
        {ONBOARDING_ITEMS.map((_, index) => (
          <View
            key={index}
            className={`onboarding-page__dot ${index === current ? 'onboarding-page__dot--active' : ''}`}
          />
        ))}
      </View>

      {/* 下一步按钮 */}
      <View className="onboarding-page__btn" onClick={handleNext}>
        <Text className="onboarding-page__btn-text">
          {isLastPage ? '开始使用' : '下一步'}
        </Text>
      </View>
    </View>
  )
}

export default OnboardingPage
