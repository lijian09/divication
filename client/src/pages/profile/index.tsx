import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState } from 'react'

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
  const { userInfo, updateUserInfo } = useUserStore()
  const { freeSingleRemaining, freeThreeRemaining, paidSingleRemaining, paidThreeRemaining } =
    useQuotaStore()

  const totalSingle = freeSingleRemaining + paidSingleRemaining
  const totalThree = freeThreeRemaining + paidThreeRemaining

  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const [nicknameValue, setNicknameValue] = useState(userInfo?.nickname || '')

  /** 打开昵称编辑 */
  const handleEditNickname = () => {
    setNicknameValue(userInfo?.nickname || '')
    setShowNicknameInput(true)
  }

  /** 保存昵称 */
  const handleSaveNickname = () => {
    const trimmed = nicknameValue.trim()
    if (!trimmed) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    if (trimmed.length > 20) {
      Taro.showToast({ title: '昵称不能超过20个字', icon: 'none' })
      return
    }
    updateUserInfo({ nickname: trimmed })
    setShowNicknameInput(false)
    Taro.showToast({ title: '昵称已更新', icon: 'success' })
  }

  /** 菜单点击 */
  const handleMenuClick = (route: string, label: string) => {
    if (route) {
      Taro.navigateTo({ url: route })
    } else {
      Taro.showToast({ title: `${label}功能开发中`, icon: 'none' })
    }
  }

  return (
    <View className="profile-page">
      <StarBackground />

      <Text className="profile-page__title">我的</Text>

      {/* 用户信息区 */}
      <View className="profile-page__user" onClick={handleEditNickname}>
        <View className="profile-page__avatar">
          <Text className="profile-page__avatar-text">
            {userInfo?.nickname?.[0] || '灵'}
          </Text>
        </View>
        <View className="profile-page__user-info">
          <Text className="profile-page__nickname">
            {userInfo?.nickname || '灵谕用户'}
          </Text>
          <Text className="profile-page__edit-hint">点击编辑昵称 &gt;</Text>
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
            onClick={() => handleMenuClick(item.route, item.label)}
          >
            <Text className="profile-page__menu-icon">{item.icon}</Text>
            <Text className="profile-page__menu-label">{item.label}</Text>
            <Text className="profile-page__menu-arrow">&gt;</Text>
          </View>
        ))}
      </View>

      {/* 版本号 */}
      <Text className="profile-page__version">v1.0.0</Text>

      {/* 昵称编辑弹窗 */}
      {showNicknameInput && (
        <View className="profile-page__modal-overlay">
          <View className="profile-page__modal">
            <Text className="profile-page__modal-title">编辑昵称</Text>
            <Input
              className="profile-page__modal-input"
              value={nicknameValue}
              onInput={(e) => setNicknameValue(e.detail.value)}
              maxlength={20}
              placeholder="输入新昵称"
              placeholderClass="profile-page__modal-placeholder"
              autoFocus
            />
            <View className="profile-page__modal-actions">
              <Text
                className="profile-page__modal-cancel"
                onClick={() => setShowNicknameInput(false)}
              >
                取消
              </Text>
              <Text
                className="profile-page__modal-confirm"
                onClick={handleSaveNickname}
              >
                保存
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ProfilePage
