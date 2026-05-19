import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'

import './index.scss'

/**
 * 付费引导弹窗组件
 * 免费用尽时引导购买套餐
 */

interface PackageOption {
  id: string
  name: string
  icon: string
  price: number
  totalQuota: number
}

interface PayWallModalProps {
  /** 是否显示 */
  visible: boolean
  /** 购买回调 */
  onPurchase: (packageId: string) => void
  /** 关闭回调 */
  onClose: () => void
}

/** 默认套餐选项 */
const DEFAULT_PACKAGES: PackageOption[] = [
  { id: 'pkg_small', name: '小确幸包', icon: '☘', price: 690, totalQuota: 7 },
  { id: 'pkg_medium', name: '知心包', icon: '★', price: 1990, totalQuota: 23 },
  { id: 'pkg_large', name: '深度包', icon: '◈', price: 3990, totalQuota: 60 },
]

const PayWallModal: FC<PayWallModalProps> = ({
  visible,
  onPurchase,
  onClose,
}) => {
  const [selectedPkg, setSelectedPkg] = useState(DEFAULT_PACKAGES[1].id) // 默认选中"知心包"

  if (!visible) return null

  const selectedPackage = DEFAULT_PACKAGES.find((p) => p.id === selectedPkg)!
  const priceYuan = (selectedPackage.price / 100).toFixed(1)

  return (
    <View className="paywall-modal">
      <View className="paywall-modal__overlay" />
      <View className="paywall-modal__container">
        <Text className="paywall-modal__title">✦ 免费次数已用完</Text>
        <Text className="paywall-modal__desc">
          今日免费占卜已使用，购买套餐继续解读
        </Text>

        {/* 套餐列表 */}
        <View className="paywall-modal__packages">
          {DEFAULT_PACKAGES.map((pkg) => (
            <View
              key={pkg.id}
              className={`paywall-modal__pkg ${selectedPkg === pkg.id ? 'paywall-modal__pkg--active' : ''}`}
              onClick={() => setSelectedPkg(pkg.id)}
            >
              <View className="paywall-modal__pkg-info">
                <Text className="paywall-modal__pkg-name">
                  {pkg.icon} {pkg.name}
                </Text>
                <Text className="paywall-modal__pkg-quota">
                  ¥{(pkg.price / 100).toFixed(1)} · {pkg.totalQuota}次
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 购买按钮 */}
        <View
          className="paywall-modal__purchase"
          onClick={() => onPurchase(selectedPkg)}
        >
          <Text className="paywall-modal__purchase-text">
            立即购买 ¥{priceYuan}
          </Text>
        </View>

        {/* 关闭 */}
        <Text className="paywall-modal__close" onClick={onClose}>
          下次再说
        </Text>
      </View>
    </View>
  )
}

export default PayWallModal
