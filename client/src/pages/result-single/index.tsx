import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect } from 'react'

import StarBackground from '@components/StarBackground'
import AiLoading from '@components/AiLoading'
import TarotCard from '@components/TarotCard'
import { useDivinationStore } from '@store/index'
import { getCardDetail } from '@services/card'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 结果页 - 单牌
 * 展示牌义 + AI 解读结果
 */
const ResultSinglePage: FC = () => {
  const {
    selectedCards,
    question,
    streamingInterpretation,
    isInterpretationDone,
  } = useDivinationStore()

  const card = selectedCards[0]
  const [isLoading, setIsLoading] = useState(!isInterpretationDone)

  /** 牌义详情（从后端获取） */
  const [cardDetail, setCardDetail] = useState<{
    keywords: string
    meaning: string
  } | null>(null)

  /** 获取牌义详情 */
  useEffect(() => {
    if (!card?.id) return

    const fetchDetail = async () => {
      try {
        const detail = await getCardDetail(card.id, !card.isUpright)
        setCardDetail({
          keywords: detail.keywords,
          meaning: detail.meaning,
        })
      } catch (err) {
        console.error('[DEBUG] 获取牌义详情失败:', err)
        // 降级：使用前端已有数据
        setCardDetail({
          keywords: card.keywords?.join(' · ') || '',
          meaning: '',
        })
      }
    }

    fetchDetail()
  }, [card?.id])

  /** 再来一次 */
  const handleRetry = () => {
    const store = useDivinationStore.getState()
    store.reset()
    Taro.navigateTo({ url: ROUTES.QUESTION_SELECT })
  }

  if (isLoading) {
    return (
      <View className="result-single-page">
        <StarBackground />
        <AiLoading onCancel={() => Taro.navigateBack()} />
      </View>
    )
  }

  return (
    <View className="result-single-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="result-single-page__nav">
        <Text className="result-single-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="result-single-page__nav-title">解读结果</Text>
      </View>

      <ScrollView className="result-single-page__scroll" scrollY>
        {/* 单牌展示 */}
        <View className="result-single-page__card">
          <TarotCard
            name={card?.name}
            isUpright={card?.isUpright}
            size="large"
            faceDown={false}
          />
        </View>

        {/* 牌名 + 正逆位 */}
        <Text className="result-single-page__card-name">
          "{card?.name}" · {card?.isUpright ? '正位' : '逆位'}
        </Text>

        {/* 关键词 */}
        {cardDetail?.keywords && (
          <Text className="result-single-page__keywords">
            关键词：{cardDetail.keywords}
          </Text>
        )}

        {/* 牌义解读 */}
        {cardDetail?.meaning && (
          <View className="result-single-page__meaning">
            <Text className="result-single-page__meaning-label">牌义解读</Text>
            <Text className="result-single-page__meaning-text">
              {cardDetail.meaning}
            </Text>
          </View>
        )}

        {/* AI 解读 */}
        <View className="result-single-page__interpretation">
          <Text className="result-single-page__interpretation-label">AI 解读</Text>
          <ScrollView className="result-single-page__interpretation-content" scrollY>
            <Text className="result-single-page__interpretation-text">
              {streamingInterpretation || '（解读内容占位）'}
            </Text>

            {/* 免责声明 */}
            <Text className="result-single-page__disclaimer">
              以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。
            </Text>
          </ScrollView>
        </View>

        {/* 操作按钮 */}
        <View className="result-single-page__actions">
          <View className="result-single-page__btn-row">
            <View className="result-single-page__retry-btn" onClick={handleRetry}>
              <Text className="result-single-page__retry-text">再来一次</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ResultSinglePage
