import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect } from 'react'

import StarBackground from '@components/StarBackground'
import { getPackageList, createOrder } from '@services/order'
import { useQuotaStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 付费套餐页
 * 从云函数获取套餐列表，选择后拉起微信支付
 */

interface PackageItem {
  id: string
  name: string
  price: number
  singleCount: number
  threeCount: number
}

const PackagesPage: FC = () => {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [selectedPkg, setSelectedPkg] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const { fetchQuota } = useQuotaStore()

  /** 加载套餐列表 */
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getPackageList()
        setPackages(list)
        if (list.length > 0) {
          setSelectedPkg(list[1]?.id || list[0].id)
        }
      } catch (err: any) {
        console.error('[DEBUG] 获取套餐列表失败:', err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const selected = packages.find((p) => p.id === selectedPkg)
  const priceYuan = selected ? (selected.price / 100).toFixed(1) : '0.0'

  /** 拉起微信支付 */
  const handlePurchase = async () => {
    if (!selected || isPaying) return

    try {
      setIsPaying(true)
      const result = await createOrder({ packageId: selected.id })

      // 拉起微信支付面板
      const payResult = await Taro.requestPayment({
        timeStamp: result.payment.timeStamp,
        nonceStr: result.payment.nonceStr,
        package: result.payment.package,
        signType: result.payment.signType as any,
        paySign: result.payment.paySign,
      })

      // 支付成功
      if (payResult.errMsg === 'requestPayment:ok') {
        await fetchQuota()
        Taro.redirectTo({
          url: `${ROUTES.PAYMENT_RESULT}?success=true&pkgName=${encodeURIComponent(selected.name)}&amount=${selected.price}&single=${selected.singleCount}&three=${selected.threeCount}`,
        })
      }
    } catch (err: any) {
      console.error('[DEBUG] 支付失败:', err.message)
      // 用户取消支付或支付失败
      Taro.redirectTo({
        url: `${ROUTES.PAYMENT_RESULT}?success=false`,
      })
    } finally {
      setIsPaying(false)
    }
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

      {isLoading ? (
        <View className="packages-page__loading">
          <Text className="packages-page__loading-text">加载中...</Text>
        </View>
      ) : (
        <>
          <View className="packages-page__content">
            <Text className="packages-page__title">选择适合你的解读套餐 ✦</Text>

            {packages.map((pkg) => {
              const totalQuota = pkg.singleCount + pkg.threeCount
              const isRecommended = totalQuota >= 10 && totalQuota <= 30
              return (
                <View
                  key={pkg.id}
                  className={`packages-page__card ${selectedPkg === pkg.id ? 'packages-page__card--active' : ''} ${isRecommended ? 'packages-page__card--recommended' : ''}`}
                  onClick={() => setSelectedPkg(pkg.id)}
                >
                  {isRecommended && (
                    <Text className="packages-page__card-badge">★ 推荐</Text>
                  )}
                  <Text className="packages-page__card-name">{pkg.name}</Text>
                  <Text className="packages-page__card-content">
                    {pkg.singleCount > 0 && `单牌 ${pkg.singleCount} 次`}
                    {pkg.singleCount > 0 && pkg.threeCount > 0 && ' + '}
                    {pkg.threeCount > 0 && `三牌 ${pkg.threeCount} 次`}
                  </Text>
                  <Text className="packages-page__card-price">
                    ¥{priceYuan}
                  </Text>
                  <Text className="packages-page__card-desc">
                    共 {totalQuota} 次解读
                  </Text>
                  {totalQuota >= 10 && (
                    <Text className="packages-page__card-per-unit">
                      每次仅 ¥{(pkg.price / 100 / totalQuota).toFixed(2)}
                    </Text>
                  )}
                </View>
              )
            })}

            <Text className="packages-page__disclaimer">
              付费内容仅供娱乐，不承诺任何效果。
            </Text>
          </View>

          <View
            className={`packages-page__buy ${isPaying ? 'packages-page__buy--disabled' : ''}`}
            onClick={handlePurchase}
          >
            <Text className="packages-page__buy-text">
              {isPaying ? '支付处理中...' : `立即购买 ¥${priceYuan}`}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

export default PackagesPage
