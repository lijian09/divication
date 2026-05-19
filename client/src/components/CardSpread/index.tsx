import { View, Text } from '@tarojs/components'
import { FC } from 'react'

import TarotCard from '../TarotCard'

import './index.scss'

/**
 * 牌阵布局组件
 * 支持单牌阵（1 张）和三牌阵（3 张：过去/现在/未来）
 */

interface CardData {
  id: string
  name: string
  nameEn?: string
  isUpright: boolean
  imageUrl?: string
  isRevealed?: boolean
}

interface CardSpreadProps {
  /** 牌阵类型 */
  type: 'single' | 'three'
  /** 牌数据 */
  cards: CardData[]
  /** 牌尺寸 */
  size?: 'large' | 'medium' | 'small'
  /** 牌是否可翻转 */
  flippable?: boolean
  /** 点击牌回调 */
  onCardClick?: (index: number) => void
}

const CardSpread: FC<CardSpreadProps> = ({
  type,
  cards,
  size = 'medium',
  flippable = false,
  onCardClick,
}) => {
  /** 三牌阵位置标签 */
  const positionLabels = ['过去', '现在', '未来']

  if (type === 'single') {
    return (
      <View className="card-spread card-spread--single">
        {cards[0] && (
          <TarotCard
            name={cards[0].name}
            isUpright={cards[0].isUpright}
            imageUrl={cards[0].imageUrl}
            size={size}
            faceDown={!cards[0].isRevealed}
            flippable={flippable}
            onClick={() => onCardClick?.(0)}
          />
        )}
      </View>
    )
  }

  // 三牌阵
  return (
    <View className="card-spread card-spread--three">
      {positionLabels.map((label, index) => (
        <View key={label} className="card-spread__item">
          {cards[index] ? (
            <TarotCard
              name={cards[index].name}
              isUpright={cards[index].isUpright}
              imageUrl={cards[index].imageUrl}
              size={size}
              faceDown={!cards[index].isRevealed}
              flippable={flippable}
              onClick={() => onCardClick?.(index)}
            />
          ) : (
            <View className={`card-spread__placeholder card-spread__placeholder--${size}`} />
          )}
          <Text className="card-spread__label">{label}</Text>
        </View>
      ))}
    </View>
  )
}

export default CardSpread
