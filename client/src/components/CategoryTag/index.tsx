import { View, Text } from '@tarojs/components'
import { FC } from 'react'

import './index.scss'

/**
 * 问题类别标签组件
 * 显示分类图标 + 名称
 */

interface CategoryTagProps {
  /** 分类 key */
  category: string
  /** 分类名称 */
  label: string
  /** 分类图标 */
  icon: string
  /** 分类颜色 */
  color?: string
  /** 尺寸 */
  size?: 'small' | 'medium'
  /** 是否选中 */
  selected?: boolean
  /** 点击回调 */
  onClick?: () => void
}

const CategoryTag: FC<CategoryTagProps> = ({
  label,
  icon,
  color = '#D4A843',
  size = 'medium',
  selected = false,
  onClick,
}) => {
  return (
    <View
      className={`category-tag category-tag--${size} ${selected ? 'category-tag--selected' : ''}`}
      style={{
        borderColor: selected ? color : 'transparent',
        backgroundColor: selected ? `${color}15` : 'rgba(255,255,255,0.05)',
      }}
      onClick={onClick}
    >
      <Text className="category-tag__icon" style={{ color }}>
        {icon}
      </Text>
      <Text className="category-tag__label">{label}</Text>
    </View>
  )
}

export default CategoryTag
