import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 历史记录列表页
 * 按时间倒序展示占卜历史记录
 * 支持下拉刷新和上拉加载
 */
const HistoryListPage: FC = () => {
  const isEmpty = true // TODO: 从 store/API 获取

  /** 跳转详情 */
  const handleItemClick = (recordId: string) => {
    Taro.navigateTo({ url: `${ROUTES.HISTORY_DETAIL}?id=${recordId}` })
  }

  return (
    <View className="history-list-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="history-list-page__nav">
        <Text
          className="history-list-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
        <Text className="history-list-page__nav-title">历史记录</Text>
        <View className="history-list-page__nav-placeholder" />
      </View>

      {isEmpty ? (
        /* 空状态 */
        <View className="history-list-page__empty">
          <View className="history-list-page__empty-icon">
            <Text className="history-list-page__empty-icon-text">🃏?</Text>
          </View>
          <Text className="history-list-page__empty-title">还没有占卜记录</Text>
          <Text className="history-list-page__empty-desc">
            抽一张牌，开启你的第一次解读吧
          </Text>
          <View
            className="history-list-page__empty-cta"
            onClick={() => Taro.switchTab({ url: ROUTES.HOME })}
          >
            <Text className="history-list-page__empty-cta-text">去占卜 ✦</Text>
          </View>
        </View>
      ) : (
        /* 记录列表 */
        <ScrollView className="history-list-page__list" scrollY>
          {/* TODO: 渲染历史记录卡片 */}
          <View className="history-list-page__month">
            <Text className="history-list-page__month-title">2026年05月</Text>
          </View>
          <View
            className="history-list-page__item"
            onClick={() => handleItemClick('mock_id')}
          >
            <Text className="history-list-page__item-date">05/18</Text>
            <Text className="history-list-page__item-category">♡ 爱情</Text>
            <Text className="history-list-page__item-question">
              我们的感情会如何发展？
            </Text>
            <Text className="history-list-page__item-spread">
              单牌阵 · 愚人 正位
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default HistoryListPage
