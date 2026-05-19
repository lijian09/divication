import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'
import CardSpread from '@components/CardSpread'
import { useDivinationStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 选牌页
 * 用户从牌堆中选择需要的牌
 * 单牌阵选 1 张，三牌阵选 3 张
 */
const PickCardPage: FC = () => {
  const { spreadType, addSelectedCard, selectedCards, setStep } = useDivinationStore()
  const maxCount = spreadType === 'three' ? 3 : 1
  const isFull = selectedCards.length >= maxCount

  /** 模拟选牌 */
  const handleCardPick = () => {
    if (isFull) return
    addSelectedCard({
      id: `card_${Date.now()}`,
      name: '愚人',
      nameEn: 'The Fool',
      isUpright: Math.random() > 0.5,
      keywords: ['新开始', '冒险'],
      imageUrl: '',
    })
  }

  /** 进入翻牌 */
  const handleReveal = () => {
    if (!isFull) return
    setStep('pick')
    Taro.navigateTo({ url: ROUTES.REVEAL })
  }

  return (
    <View className="pick-card-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="pick-card-page__nav">
        <Text className="pick-card-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="pick-card-page__nav-title">选牌中</Text>
      </View>

      {/* 选中区域 */}
      <View className="pick-card-page__selected">
        <CardSpread
          type={spreadType || 'single'}
          cards={selectedCards.map((c) => ({ ...c, isRevealed: false }))}
          size="small"
        />
      </View>

      {/* 牌堆（点击选牌） */}
      <Text className="pick-card-page__hint">轻触选择牌面</Text>
      <View className="pick-card-page__deck" onClick={handleCardPick}>
        {Array.from({ length: 8 }, (_, i) => (
          <View
            key={i}
            className="pick-card-page__deck-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <View className="pick-card-page__deck-back">
              <Text className="pick-card-page__deck-symbol">✦</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 底部操作栏 */}
      <View className="pick-card-page__action">
        <Text className="pick-card-page__action-count">
          已选 {selectedCards.length}/{maxCount}
        </Text>
        <View
          className={`pick-card-page__action-btn ${isFull ? '' : 'pick-card-page__action-btn--disabled'}`}
          onClick={isFull ? handleReveal : undefined}
        >
          <Text className="pick-card-page__action-btn-text">
            {isFull ? '翻牌 ▶' : '请选择牌'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PickCardPage
