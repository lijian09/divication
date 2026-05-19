import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'
import ShuffleDeck from '@components/ShuffleDeck'
import { useDivinationStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 洗牌页
 * 通过手势洗牌动画营造仪式感
 * 洗牌完成后进入选牌阶段
 */
const ShufflePage: FC = () => {
  const { spreadType, setStep } = useDivinationStore()
  const [isShuffleComplete, setIsShuffleComplete] = useState(false)

  /** 洗牌完成回调 */
  const handleShuffleComplete = () => {
    setIsShuffleComplete(true)
  }

  /** 进入选牌页 */
  const handlePickCard = () => {
    setStep('shuffle')
    Taro.navigateTo({ url: ROUTES.PICK_CARD })
  }

  return (
    <View className="shuffle-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="shuffle-page__nav">
        <Text className="shuffle-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="shuffle-page__nav-title">
          {isShuffleComplete ? '选牌中' : '洗牌中'}
        </Text>
        <Text className="shuffle-page__nav-progress">3/3 ●●●</Text>
      </View>

      {/* 引导提示 */}
      <Text className="shuffle-page__hint">
        {isShuffleComplete
          ? `轻触选择 ${spreadType === 'three' ? '3' : '1'} 张牌 ✦`
          : '上下滑动开始洗牌 ✦'}
      </Text>

      {/* 洗牌动画 */}
      <ShuffleDeck
        cardCount={spreadType === 'three' ? 15 : 12}
        onShuffleComplete={handleShuffleComplete}
      />

      {/* 洗牌完成后的进入按钮 */}
      {isShuffleComplete && (
        <View className="shuffle-page__pick-btn" onClick={handlePickCard}>
          <Text className="shuffle-page__pick-btn-text">开始选牌</Text>
        </View>
      )}
    </View>
  )
}

export default ShufflePage
