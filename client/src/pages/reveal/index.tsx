import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'
import TarotCard from '@components/TarotCard'
import CardSpread from '@components/CardSpread'
import { useDivinationStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 翻牌页
 * 用户翻看选中的牌，产生揭晓命运的沉浸感
 * 翻完后自动跳转解读结果页
 */
const RevealPage: FC = () => {
  const { selectedCards, spreadType, setStep } = useDivinationStore()
  const [revealedCount, setRevealedCount] = useState(0)
  const isAllRevealed = revealedCount >= selectedCards.length

  /** 点击翻牌 */
  const handleFlip = (index: number) => {
    if (index === revealedCount) {
      setRevealedCount((prev) => prev + 1)
    }
  }

  /** 查看完整解读 */
  const handleViewResult = () => {
    setStep('reveal')
    const route =
      spreadType === 'three' ? ROUTES.RESULT_THREE : ROUTES.RESULT_SINGLE
    Taro.navigateTo({ url: route })
  }

  return (
    <View className="reveal-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="reveal-page__nav">
        <Text className="reveal-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="reveal-page__nav-title">
          {isAllRevealed ? '全部揭晓' : '轻触牌面揭晓命运'}
        </Text>
      </View>

      {/* 牌面展示 */}
      <View className="reveal-page__cards">
        {selectedCards.map((card, index) => (
          <View key={card.id} className="reveal-page__card-wrap">
            <TarotCard
              name={card.name}
              isUpright={card.isUpright}
              size={spreadType === 'three' ? 'medium' : 'large'}
              faceDown={index >= revealedCount}
              flippable={index === revealedCount}
              onClick={() => handleFlip(index)}
              positionLabel={
                spreadType === 'three'
                  ? ['过去', '现在', '未来'][index]
                  : ''
              }
            />
            {index < revealedCount && (
              <View className="reveal-page__card-info">
                <Text className="reveal-page__card-name">
                  "{card.name}" {card.isUpright ? '正位' : '逆位'}
                </Text>
                <Text className="reveal-page__card-keywords">
                  关键词：{card.keywords.join(' · ')}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 翻牌引导 */}
      {!isAllRevealed && revealedCount < selectedCards.length && (
        <Text className="reveal-page__flip-hint">
          翻开下一张牌 ▼
        </Text>
      )}

      {/* 查看解读按钮 */}
      {isAllRevealed && (
        <View className="reveal-page__result-btn" onClick={handleViewResult}>
          <Text className="reveal-page__result-btn-text">查看完整解读</Text>
        </View>
      )}
    </View>
  )
}

export default RevealPage
