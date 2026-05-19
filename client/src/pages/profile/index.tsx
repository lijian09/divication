import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import { useUserStore, useQuotaStore } from '@store/index'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 个人中心页
 * 展示用户信息、配额余额、功能入口
 * TabBar 第三个页面
 */

const MENU_ITEMS = [
  { icon: '📋', label: '历史记录', route: ROUTES.HISTORY_LIST },
  { icon: '💰', label: '购买套餐', route: ROUTES.PACKAGES },
  { icon: '📖', label: '牌义库', route: '' },
  { icon: '💬', label: '意见反馈', route: '' },
  { icon: 'ℹ️', label: '关于我们', route: ROUTES.SETTINGS },
  { icon: '📜', label: '用户协议 & 隐私', route: '' },
]

const ProfilePage: FC = () => {
  const { userInfo } = useUserStore()
  const { freeSingleRemaining, freeThreeRemaining, paidSingleRemaining, paidThreeRemaining } =
    useQuotaStore()

  const totalSingle = freeSingleRemaining + paidSingleRemaining
  const totalThree = freeThreeRemaining + paidThreeRemaining

  const handleMenuClick = (route: string) => {
    if (route) {
      Taro.navigateTo({ url: route })
    }
  }

  return (
    <View className="profile-page">
      <StarBackground />

      <Text className="profile-page__title">我的</Text>

      {/* 用户信息区 */}
      <View className="profile-page__user">
        <View className="profile-page__avatar">
          <Text className="profile-page__avatar-text">
            {userInfo?.nickname?.[0] || '灵'}
          </Text>
        </View>
        <View className="profile-page__user-info">
          <Text className="profile-page__nickname">
            {userInfo?.nickname || '灵谕用户'}
          </Text>
          <Text className="profile-page__edit-hint">编辑昵称 &gt;</Text>
        </View>
      </View>

      {/* 配额卡片 */}
      <View className="profile-page__quota">
        <Text className="profile-page__quota-title">✦ 我的额度</Text>
        <View className="profile-page__quota-items">
          <View className="profile-page__quota-item">
            <Text className="profile-page__quota-count">{totalSingle}</Text>
            <Text className="profile-page__quota-label">单牌 剩余</Text>
          </View>
          <View className="profile-page__quota-divider" />
          <View className="profile-page__quota-item">
            <Text className="profile-page__quota-count">{totalThree}</Text>
            <Text className="profile-page__quota-label">三牌 剩余</Text>
          </View>
        </View>
        <Text
          className="profile-page__quota-buy"
          onClick={() => Taro.navigateTo({ url: ROUTES.PACKAGES })}
        >
          购买更多额度 &gt;
        </Text>
      </View>

      {/* 功能菜单 */}
      <View className="profile-page__menu">
        {MENU_ITEMS.map((item) => (
          <View
            key={item.label}
            className="profile-page__menu-item"
            onClick={() => handleMenuClick(item.route)}
          >
            <Text className="profile-page__menu-icon">{item.icon}</Text>
            <Text className="profile-page__menu-label">{item.label}</Text>
            <Text className="profile-page__menu-arrow">&gt;</Text>
          </View>
        ))}
      </View>

      {/* 版本号 */}
      <Text className="profile-page__version">v1.0.0</Text>
    </View>
  )
}

export default ProfilePage
