import { View } from '@tarojs/components'
import { FC, useMemo } from 'react'

import './index.scss'

/**
 * 星空粒子背景组件
 * 用 CSS 实现简单的星星闪烁效果
 * 使用固定定位覆盖整个视口
 */

interface StarBackgroundProps {
  /** 星星数量，默认 30 */
  starCount?: number
}

const StarBackground: FC<StarBackgroundProps> = ({ starCount = 30 }) => {
  /**
   * 随机生成星星位置和动画参数
   * 每颗星星有独立的：
   * - 位置（top/left 百分比）
   * - 大小（2-6rpx）
   * - 闪烁延迟
   * - 闪烁持续时间
   */
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 4}rpx`,
      delay: `${Math.random() * 3}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  }, [starCount])

  return (
    <View className="star-background">
      {stars.map((star) => (
        <View
          key={star.id}
          className="star-background__star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  )
}

export default StarBackground
