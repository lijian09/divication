import { View, Text } from '@tarojs/components'
import { FC } from 'react'

import './index.scss'

/**
 * 免费次数徽章组件
 * 显示剩余占卜次数
 */

interface QuotaBadgeProps {
  /** 剩余单牌次数 */
  singleCount: number
  /** 剩余三牌次数 */
  threeCount: number
  /** 是否用尽 */
  isExhausted?: boolean
  /** 点击跳转付费页回调 */
  onClick?: () => void
}

const QuotaBadge: FC<QuotaBadgeProps> = ({
  singleCount,
  threeCount,
  isExhausted = false,
  onClick,
}) => {
  return (
    <View
      className={`quota-badge ${isExhausted ? 'quota-badge--exhausted' : ''}`}
      onClick={onClick}
    >
      <Text className="quota-badge__label">✦ 剩余免费次数</Text>
      <View className="quota-badge__counts">
        <Text className="quota-badge__count">
          单牌 {singleCount} 次
        </Text>
        <Text className="quota-badge__divider">·</Text>
        <Text className="quota-badge__count">
          三牌 {threeCount} 次
        </Text>
      </View>
      {onClick && (
        <Text className="quota-badge__link">获取更多 ></Text>
      )}
    </View>
  )
}

export default QuotaBadge
