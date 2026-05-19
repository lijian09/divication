import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'

import './index.scss'

/**
 * 设置页 / 关于我们
 * 查看关于我们、协议入口、注销账号
 */
const SettingsPage: FC = () => {
  /** 注销账号确认 */
  const handleDeleteAccount = () => {
    Taro.showModal({
      title: '确认注销账号？',
      content:
        '注销后：\n• 所有占卜记录将被永久删除\n• 剩余额度将失效\n• 7 个工作日后不可恢复',
      confirmText: '确认注销',
      confirmColor: '#E53935',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用注销 API
          Taro.showToast({ title: '注销请求已提交', icon: 'none' })
        }
      },
    })
  }

  return (
    <View className="settings-page">
      <StarBackground />

      <View className="settings-page__nav">
        <Text
          className="settings-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
        <Text className="settings-page__nav-title">关于我们</Text>
        <View className="settings-page__nav-placeholder" />
      </View>

      {/* Logo */}
      <View className="settings-page__logo">
        <View className="settings-page__logo-box">
          <Text className="settings-page__logo-text">灵谕</Text>
        </View>
        <Text className="settings-page__version">v1.0.0</Text>
        <Text className="settings-page__slogan">用严谨的占星逻辑</Text>
        <Text className="settings-page__slogan">为你抽一张牌，说一句真话</Text>
      </View>

      {/* 功能菜单 */}
      <View className="settings-page__menu">
        <View className="settings-page__menu-item">
          <Text className="settings-page__menu-icon">📜</Text>
          <Text className="settings-page__menu-label">用户协议</Text>
          <Text className="settings-page__menu-arrow">&gt;</Text>
        </View>
        <View className="settings-page__menu-item">
          <Text className="settings-page__menu-icon">🔒</Text>
          <Text className="settings-page__menu-label">隐私政策</Text>
          <Text className="settings-page__menu-arrow">&gt;</Text>
        </View>
        <View className="settings-page__menu-item">
          <Text className="settings-page__menu-icon">⭐</Text>
          <Text className="settings-page__menu-label">给个好评</Text>
          <Text className="settings-page__menu-arrow">&gt;</Text>
        </View>
        <View className="settings-page__menu-item">
          <Text className="settings-page__menu-icon">💬</Text>
          <Text className="settings-page__menu-label">意见反馈</Text>
          <Text className="settings-page__menu-arrow">&gt;</Text>
        </View>
      </View>

      {/* 注销账号 */}
      <View className="settings-page__danger-zone">
        <View
          className="settings-page__menu-item settings-page__menu-item--danger"
          onClick={handleDeleteAccount}
        >
          <Text className="settings-page__menu-icon">⚠️</Text>
          <Text className="settings-page__menu-label settings-page__menu-label--danger">
            注销账号
          </Text>
          <Text className="settings-page__menu-arrow">&gt;</Text>
        </View>
        <Text className="settings-page__danger-hint">
          注销后 7 个工作日内删除全部数据，且不可恢复
        </Text>
      </View>

      {/* 版权 */}
      <Text className="settings-page__copyright">
        © 2026 灵谕 All Rights Reserved
      </Text>
    </View>
  )
}

export default SettingsPage
