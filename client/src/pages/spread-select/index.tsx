import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'
import { useDivinationStore, useQuotaStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 牌阵选择页
 * 让用户选择单牌阵或三牌阵
 * 第 2 步（进度 2/3）
 */
const SpreadSelectPage: FC = () => {
  const { setSpreadType, setStep } = useDivinationStore()
  const { freeSingleRemaining, freeThreeRemaining, paidSingleRemaining, paidThreeRemaining } =
    useQuotaStore()
  const [selected, setSelected] = useState<'single' | 'three' | null>(null)

  const totalSingle = freeSingleRemaining + paidSingleRemaining
  const totalThree = freeThreeRemaining + paidThreeRemaining

  const handleSelect = (type: 'single' | 'three') => {
    // 检查对应类型是否有可用次数
    if (type === 'single' && totalSingle <= 0) return
    if (type === 'three' && totalThree <= 0) return
    setSelected(type)
  }

  const handleStart = () => {
    if (!selected) return
    setSpreadType(selected)
    setStep('spread')
    Taro.navigateTo({ url: ROUTES.SHUFFLE })
  }

  return (
    <View className="spread-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="spread-page__nav">
        <Text className="spread-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="spread-page__nav-title">选择牌阵</Text>
        <Text className="spread-page__nav-progress">2/3 ●●○</Text>
      </View>

      <View className="spread-page__content">
        <Text className="spread-page__title">选择一种解读方式</Text>

        {/* 单牌阵 */}
        <View
          className={`spread-page__card ${
            totalSingle <= 0 ? 'spread-page__card--disabled' : ''
          } ${selected === 'single' ? 'spread-page__card--active' : ''}`}
          onClick={() => handleSelect('single')}
        >
          <View className="spread-page__card-single-icon">
            <View className="spread-page__mini-card" />
          </View>
          <Text className="spread-page__card-name">单牌解读</Text>
          <Text className="spread-page__card-desc">简洁快速，一次指引</Text>
          <View className="spread-page__card-cost-row">
            <Text className="spread-page__card-cost">消耗 1 次单牌额度</Text>
            <Text
              className={`spread-page__card-remain ${
                totalSingle <= 0 ? 'spread-page__card-remain--empty' : ''
              }`}
            >
              剩余 {totalSingle} 次
            </Text>
          </View>
        </View>

        {/* 三牌阵 */}
        <View
          className={`spread-page__card ${
            totalThree <= 0 ? 'spread-page__card--disabled' : ''
          } ${selected === 'three' ? 'spread-page__card--active' : ''}`}
          onClick={() => handleSelect('three')}
        >
          <Text className="spread-page__card-badge">★ 推荐</Text>
          <View className="spread-page__card-three-icon">
            <View className="spread-page__mini-card" />
            <View className="spread-page__mini-card" />
            <View className="spread-page__mini-card" />
          </View>
          <Text className="spread-page__card-name">三牌阵</Text>
          <Text className="spread-page__card-desc">过去 / 现在 / 未来，深度解读</Text>
          <View className="spread-page__card-cost-row">
            <Text className="spread-page__card-cost">消耗 1 次三牌额度</Text>
            <Text
              className={`spread-page__card-remain ${
                totalThree <= 0 ? 'spread-page__card-remain--empty' : ''
              }`}
            >
              剩余 {totalThree} 次
            </Text>
          </View>
        </View>
      </View>

      {/* 开始按钮 */}
      <View
        className={`spread-page__start ${selected ? '' : 'spread-page__start--disabled'}`}
        onClick={selected ? handleStart : undefined}
      >
        <Text className="spread-page__start-text">开始洗牌</Text>
      </View>
    </View>
  )
}

export default SpreadSelectPage
