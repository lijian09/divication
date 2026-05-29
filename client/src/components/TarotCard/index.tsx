import { View, Image, Text } from '@tarojs/components'
import { CSSProperties, FC, useState, useCallback, useRef, useEffect } from 'react'

import './index.scss'

/**
 * 塔罗牌组件
 * 支持正面/背面/3D 翻转动画
 * CSS 3D transform + 光影扫过效果
 */

interface TarotCardProps {
  /** 牌名 */
  name?: string
  /** 英文名 */
  nameEn?: string
  /** 正位/逆位 */
  isUpright?: boolean
  /** 牌面图片 URL */
  imageUrl?: string
  /** 是否为背面 */
  faceDown?: boolean
  /** 是否可点击翻转 */
  flippable?: boolean
  /** 尺寸：large（200x320）/ medium（100x160）/ small（80x128） */
  size?: 'large' | 'medium' | 'small'
  /** 位置标签（三牌阵用） */
  positionLabel?: string
  /** 点击回调 */
  onClick?: () => void
  /** 自定义样式 */
  style?: CSSProperties
}

const TarotCard: FC<TarotCardProps> = ({
  name = '',
  nameEn = '',
  isUpright = true,
  imageUrl = '',
  faceDown = true,
  flippable = false,
  size = 'medium',
  positionLabel = '',
  onClick,
  style,
}) => {
  const [isFlipped, setIsFlipped] = useState(!faceDown)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 组件卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleTap = useCallback(() => {
    if (flippable && !isFlipped) {
      setIsAnimating(true)
      setIsFlipped(true)
      timerRef.current = setTimeout(() => setIsAnimating(false), 700)
    }
    onClick?.()
  }, [flippable, isFlipped, onClick])

  const cardClass = [
    'tarot-card',
    `tarot-card--${size}`,
    isFlipped ? 'tarot-card--flipped' : '',
    isAnimating ? 'tarot-card--animating' : '',
  ].filter(Boolean).join(' ')

  return (
    <View className={cardClass} style={style} onClick={handleTap}>
      {/* 牌背面 */}
      <View className="tarot-card__face tarot-card__back">
        <View className="tarot-card__back-pattern">
          <Text className="tarot-card__back-symbol">✦</Text>
        </View>
      </View>

      {/* 牌正面 */}
      <View className="tarot-card__face tarot-card__front">
        {imageUrl && (
          <Image
            className="tarot-card__image"
            src={imageUrl}
            mode="aspectFill"
            lazyLoad
          />
        )}
        <View className="tarot-card__info">
          <Text className="tarot-card__name">{name}</Text>
          {size !== 'small' && (
            <Text className={`tarot-card__position ${isUpright ? '' : 'tarot-card__position--reversed'}`}>
              {isUpright ? '正位' : '逆位'}
            </Text>
          )}
        </View>
        {/* 光影扫过层 */}
        <View className="tarot-card__shine" />
      </View>

      {/* 位置标签 */}
      {positionLabel && (
        <Text className="tarot-card__label">{positionLabel}</Text>
      )}
    </View>
  )
}

export default TarotCard
