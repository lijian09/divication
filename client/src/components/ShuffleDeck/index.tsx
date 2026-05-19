import { View } from '@tarojs/components'
import { FC, useState, useRef, useCallback } from 'react'

import './index.scss'

/**
 * 洗牌动画组件
 * 牌面交错位移 + 旋转动画
 * 通过手势滑动进度，进度满后完成洗牌
 */

interface ShuffleDeckProps {
  /** 牌数量 */
  cardCount?: number
  /** 洗牌完成回调 */
  onShuffleComplete?: () => void
}

const ShuffleDeck: FC<ShuffleDeckProps> = ({
  cardCount = 12,
  onShuffleComplete,
}) => {
  const [progress, setProgress] = useState(0) // 0-100
  const [isShuffling, setIsShuffling] = useState(true)
  const lastY = useRef(0)
  const totalDistance = useRef(0)

  /**
   * 处理触摸滑动
   * 上下滑动累计距离，达到阈值后完成洗牌
   */
  const handleTouchMove = useCallback(
    (e: any) => {
      if (!isShuffling) return

      const touchY = e.touches[0].clientY
      const deltaY = Math.abs(touchY - lastY.current)
      lastY.current = touchY

      totalDistance.current += deltaY
      // 需要累计滑动约 600px 才能完成
      const newProgress = Math.min(100, (totalDistance.current / 600) * 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        setIsShuffling(false)
        onShuffleComplete?.()
      }
    },
    [isShuffling, onShuffleComplete],
  )

  /** 触摸开始，记录起始位置 */
  const handleTouchStart = useCallback((e: any) => {
    lastY.current = e.touches[0].clientY
  }, [])

  /** 生成牌堆中的牌 */
  const renderCards = () => {
    const cards = []
    for (let i = 0; i < cardCount; i++) {
      const delay = (i % 5) * 0.1 // 交错延迟
      const offset = isShuffling
        ? `translateX(${Math.sin(i + progress * 0.1) * 15}rpx)
           translateY(${Math.cos(i + progress * 0.1) * 10}rpx)
           rotate(${Math.sin(i + progress * 0.05) * 8}deg)`
        : `translateX(${(i % 4) * 10 - 15}rpx)
           translateY(${Math.floor(i / 4) * 5 - 5}rpx)`

      cards.push(
        <View
          key={i}
          className={`shuffle-deck__card ${isShuffling ? 'shuffle-deck__card--shuffling' : 'shuffle-deck__card--idle'}`}
          style={{
            transform: offset,
            animationDelay: `${delay}s`,
          }}
        >
          <View className="shuffle-deck__card-back">
            <View className="shuffle-deck__card-pattern" />
          </View>
        </View>,
      )
    }
    return cards
  }

  return (
    <View
      className="shuffle-deck"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <View className="shuffle-deck__pile">{renderCards()}</View>

      {/* 进度条 */}
      <View className="shuffle-deck__progress">
        <View
          className="shuffle-deck__progress-bar"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  )
}

export default ShuffleDeck
