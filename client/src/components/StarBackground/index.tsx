import { View } from '@tarojs/components'
import { FC, useMemo } from 'react'
import { getStarParticleCount } from '@utils/performance'

import './index.scss'

/**
 * 星空粒子背景组件 — F-507/F-510
 * 多层粒子 + 独立闪烁 + 缓慢漂浮
 * 低端设备自动关闭粒子
 */

interface StarBackgroundProps {
  /** 星星数量（覆盖自动检测） */
  starCount?: number
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const StarBackground: FC<StarBackgroundProps> = ({ starCount }) => {
  const count = starCount ?? getStarParticleCount()

  const stars = useMemo(() => {
    if (count === 0) return []

    return Array.from({ length: count }, (_, i) => {
      const sizeRoll = Math.random()
      let size: number
      let type: 'small' | 'medium' | 'large'
      if (sizeRoll < 0.6) {
        size = rand(2, 4)
        type = 'small'
      } else if (sizeRoll < 0.9) {
        size = rand(4, 6)
        type = 'medium'
      } else {
        size = rand(6, 10)
        type = 'large'
      }

      return {
        id: i,
        top: `${rand(0, 100)}%`,
        left: `${rand(0, 100)}%`,
        size: `${size}rpx`,
        twinkleDelay: `${rand(0, 5)}s`,
        twinkleDuration: `${rand(3, 6)}s`,
        driftDelay: `${rand(0, 8)}s`,
        driftDuration: `${rand(15, 30)}s`,
        opacity: type === 'large' ? rand(0.5, 0.8) : rand(0.2, 0.6),
        type,
      }
    })
  }, [count])

  return (
    <View className="star-background">
      {stars.map((star) => (
        <View
          key={star.id}
          className={`star-background__star star-background__star--${star.type}`}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.twinkleDelay}, ${star.driftDelay}`,
            animationDuration: `${star.twinkleDuration}, ${star.driftDuration}`,
          }}
        />
      ))}
    </View>
  )
}

export default StarBackground
