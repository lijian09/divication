import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'

import './index.scss'

/**
 * 付费套餐页
 * 展示付费套餐选项，引导用户购买
 */

const PACKAGES = [
  {
    id: 'pkg_small',
    name: '小确幸包',
    icon: '☘',
    singleQuota: 5,
    threeQuota: 2,
    price: 690,
    perUnit: '',
    desc: '入门体验',
  },
  {
    id: 'pkg_medium',
    name: '知心包',
    icon: '★',
    singleQuota: 15,
    threeQuota: 8,
    price: 1990,
    perUnit: '每次仅 ¥0.87',
    desc: '性价比之选',
    recommended: true,
  },
  {
    id: 'pkg_large',
    name: '深度包',
    icon: '◈',
    singleQuota: 40,
    threeQuota: 20,
    price: 3990,
    perUnit: '每次仅 ¥0.67',
    desc: '高频用户优选',
  },
]

const PackagesPage: FC = () => {
  const [selectedPkg, setSelectedPkg] = useState('pkg_medium')

  const selected = PACKAGES.find((p) => p.id === selectedPkg)!
  const priceYuan = (selected.price / 100).toFixed(1)

  const handlePurchase = () => {
    // TODO: 创建订单 + 拉起微信支付
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  return (
    <View className="packages-page">
      <StarBackground />

      <View className="packages-page__nav">
        <Text
          className="packages-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
        <Text className="packages-page__nav-title">购买套餐</Text>
        <View className="packages-page__nav-placeholder" />
      </View>

      <View className="packages-page__content">
        <Text className="packages-page__title">选择适合你的解读套餐 ✦</Text>

        {PACKAGES.map((pkg) => (
          <View
            key={pkg.id}
            className={`packages-page__card ${selectedPkg === pkg.id ? 'packages-page__card--active' : ''} ${pkg.recommended ? 'packages-page__card--recommended' : ''}`}
            onClick={() => setSelectedPkg(pkg.id)}
          >
            {pkg.recommended && (
              <Text className="packages-page__card-badge">★ 推荐</Text>
            )}
            <Text className="packages-page__card-name">
              {pkg.icon} {pkg.name}
            </Text>
            <Text className="packages-page__card-content">
              单牌 {pkg.singleQuota} 次 + 三牌 {pkg.threeQuota} 次
            </Text>
            <Text className="packages-page__card-price">
              ¥{(pkg.price / 100).toFixed(1)}
            </Text>
            <Text className="packages-page__card-desc">{pkg.desc}</Text>
            {pkg.perUnit && (
              <Text className="packages-page__card-per-unit">{pkg.perUnit}</Text>
            )}
          </View>
        ))}

        <Text className="packages-page__disclaimer">
          付费内容仅供娱乐，不承诺任何效果。
        </Text>
      </View>

      <View className="packages-page__buy" onClick={handlePurchase}>
        <Text className="packages-page__buy-text">立即购买 ¥{priceYuan}</Text>
      </View>
    </View>
  )
}

export default PackagesPage
