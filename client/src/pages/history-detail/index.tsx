import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC } from 'react'

import StarBackground from '@components/StarBackground'

import './index.scss'

/**
 * 历史记录详情页
 * 展示单条占卜记录的完整内容
 */
const HistoryDetailPage: FC = () => {
  const router = useRouter()
  const recordId = router.params.id

  return (
    <View className="history-detail-page">
      <StarBackground />

      <View className="history-detail-page__nav">
        <Text
          className="history-detail-page__nav-back"
          onClick={() => Taro.navigateBack()}
        >
          &lt; 返回
        </Text>
        <Text className="history-detail-page__nav-title">占卜详情</Text>
        <View className="history-detail-page__nav-placeholder" />
      </View>

      <ScrollView className="history-detail-page__scroll" scrollY>
        {/* 时间戳 */}
        <Text className="history-detail-page__timestamp">
          2026年05月18日 14:30
        </Text>
        <Text className="history-detail-page__meta">♡ 爱情 · 单牌阵</Text>

        {/* 问题卡片 */}
        <View className="history-detail-page__question">
          <Text className="history-detail-page__question-label">你的问题：</Text>
          <Text className="history-detail-page__question-text">
            我们的感情会如何发展？
          </Text>
        </View>

        {/* 牌面展示（占位） */}
        <View className="history-detail-page__card-placeholder">
          <Text className="history-detail-page__card-placeholder-text">
            牌面展示区域
          </Text>
        </View>

        {/* 解读内容 */}
        <View className="history-detail-page__interpretation">
          <Text className="history-detail-page__interpretation-title">
            "愚人" · 正位
          </Text>
          <Text className="history-detail-page__interpretation-keywords">
            关键词：新开始 · 冒险
          </Text>
          <Text className="history-detail-page__interpretation-content">
            这张"愚人"牌在正位出现，对你这个问题，传递了一个非常明确的信号——新的开始正在等待你...
          </Text>
          <Text className="history-detail-page__disclaimer">
            以上解读由 AI 生成，仅供娱乐参考。
          </Text>
        </View>

        {/* 查看牌义 */}
        <View className="history-detail-page__view-card-btn">
          <Text className="history-detail-page__view-card-text">
            📖 查看牌义详解
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default HistoryDetailPage
