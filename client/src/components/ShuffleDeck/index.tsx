import { View } from '@tarojs/components'
import { FC, useState, useRef, useCallback } from 'react'

import './index.scss'

/**
 * 洗牌动画组件 — F-506 手势动效优化
 * 物理感阻尼 + 交错动画 + 进度反馈
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
  const [progress, setProgress] = useState(0)
  const [isShuffling, setIsShuffling] = useState(true)
  const [swipeIntensity, setSwipeIntensity] = useState(0) // 0-1 滑动强度
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const totalDistance = useRef(0)
  const velocity = useRef(0) // 速度（px/ms）

  /** 处理触摸滑动 — 带速度检测和阻尼 */
  const handleTouchMove = useCallback(
    (e: any) => {
      if (!isShuffling) return

      const touchY = e.touches[0].clientY
      const now = Date.now()
      const deltaY = Math.abs(touchY - lastY.current)
      const deltaTime = Math.max(now - lastTime.current, 1)

      // 计算瞬时速度
      velocity.current = deltaY / deltaTime
      lastY.current = touchY
      lastTime.current = now

      // 速度映射到强度（0-1），带阻尼衰减
      const rawIntensity = Math.min(velocity.current / 2, 1)
      setSwipeIntensity((prev) => prev * 0.7 + rawIntensity * 0.3) // 平滑过渡

      totalDistance.current += deltaY
      // 需要累计滑动约 500px 完成（降低门槛）
      const newProgress = Math.min(100, (totalDistance.current / 500) * 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        setIsShuffling(false)
        setSwipeIntensity(0)
        onShuffleComplete?.()
      }
    },
    [isShuffling, onShuffleComplete],
  )

  /** 触摸开始 */
  const handleTouchStart = useCallback((e: any) => {
    lastY.current = e.touches[0].clientY
    lastTime.current = Date.now()
  }, [])

  /** 触摸结束 — 强度衰减 */
  const handleTouchEnd = useCallback(() => {
    // 松手后强度快速衰减
    const decay = () => {
      setSwipeIntensity((prev) => {
        if (prev < 0.01) return 0
        requestAnimationFrame(decay)
        return prev * 0.85
      })
    }
    requestAnimationFrame(decay)
  }, [])

  /** 生成牌堆 — 根据滑动强度动态计算偏移 */
  const renderCards = () => {
    const cards = []
    for (let i = 0; i < cardCount; i++) {
      const phase = (i * 137.5) % 360 // 黄金角分布，避免整齐排列
      const sinVal = Math.sin((phase + progress * 2) * (Math.PI / 180))
      const cosVal = Math.cos((phase + progress * 1.5) * (Math.PI / 180))

      // 基础偏移 + 滑动强度驱动的动态偏移
      const baseOffset = isShuffling ? 8 : 4
      const dynamicScale = isShuffling ? swipeIntensity * 2 + 1 : 1
      const tx = sinVal * baseOffset * dynamicScale
      const ty = cosVal * baseOffset * dynamicScale
      const rotate = sinVal * (5 + swipeIntensity * 10)

      const offset = `translateX(${tx}rpx) translateY(${ty}rpx) rotate(${rotate}deg)`

      // 交错延迟：基于牌的索引
      const delay = isShuffling
        ? `${(i % 5) * 0.06}s`
        : '0s'

      cards.push(
        <View
          key={i}
          className={`shuffle-deck__card ${isShuffling ? 'shuffle-deck__card--shuffling' : 'shuffle-deck__card--idle'}`}
          style={{
            transform: offset,
            animationDelay: delay,
            transitionDuration: isShuffling ? '0.15s' : '0.4s',
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
      onTouchEnd={handleTouchEnd}
    >
      <View className="shuffle-deck__pile">
        {renderCards()}
        {/* 牌堆光晕 — 随滑动强度变化 */}
        {isShuffling && swipeIntensity > 0.1 && (
          <View
            className="shuffle-deck__glow"
            style={{ opacity: swipeIntensity * 0.3 }}
          />
        )}
      </View>

      {/* 进度条 */}
      <View className="shuffle-deck__progress">
        <View
          className="shuffle-deck__progress-bar"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* 进度百分比 */}
      {isShuffling && progress > 0 && (
        <View className="shuffle-deck__progress-text">
          {Math.round(progress)}%
        </View>
      )}
    </View>
  )
}

export default ShuffleDeck
