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
 * 结果页 - 三牌阵
 * 展示三牌阵牌义 + AI 解读，分过去/现在/未来
 */
const ResultThreePage: FC = () => {
  const {
    selectedCards,
    question,
    streamingInterpretation,
    isInterpretationDone,
  } = useDivinationStore()

  const [isLoading, setIsLoading] = useState(!isInterpretationDone)
  const positionLabels = ['过去', '现在', '未来']
  const positionIcons = ['☽', '★', '✦']

  /** 每张牌的牌义详情 */
  const [cardDetails, setCardDetails] = useState<
    Array<{ keywords: string; meaning: string }>
  >([])

  /** 批量获取三张牌的牌义 */
  useEffect(() => {
    if (selectedCards.length === 0) return

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          selectedCards.map((card) => getCardDetail(card.id, !card.isUpright)),
        )
        setCardDetails(
          results.map((r) => ({ keywords: r.keywords, meaning: r.meaning })),
        )
      } catch (err) {
        console.error('[DEBUG] 获取牌义详情失败:', err)
        setCardDetails(
          selectedCards.map((card) => ({
            keywords: card.keywords?.join(' · ') || '',
            meaning: '',
          })),
        )
      }
    }

    fetchAll()
  }, [selectedCards.map((c) => c.id).join(',')])

  const handleRetry = () => {
    useDivinationStore.getState().reset()
    Taro.navigateTo({ url: ROUTES.QUESTION_SELECT })
  }

  if (isLoading) {
    return (
      <View className="result-three-page">
        <StarBackground />
        <AiLoading onCancel={() => Taro.navigateBack()} />
      </View>
    )
  }

  return (
    <View className="result-three-page">
      <StarBackground />

      <View className="result-three-page__nav">
        <Text className="result-three-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="result-three-page__nav-title">解读结果</Text>
      </View>

      <ScrollView className="result-three-page__scroll" scrollY>
        {/* 三牌横向排列 */}
        <View className="result-three-page__cards">
          {selectedCards.map((card, index) => (
            <View key={card.id} className="result-three-page__card-item">
              <TarotCard
                name={card.name}
                isUpright={card.isUpright}
                size="medium"
                faceDown={false}
              />
              <Text className="result-three-page__card-label">
                {positionLabels[index]}
              </Text>
            </View>
          ))}
        </View>

        {/* 用户问题回显 */}
        <View className="result-three-page__question">
          <Text className="result-three-page__question-text">
            你的问题：{question}
          </Text>
        </View>

        {/* 分段牌义 + 解读 */}
        {selectedCards.map((card, index) => {
          const detail = cardDetails[index]
          return (
            <View key={card.id} className="result-three-page__section">
              <Text className="result-three-page__section-title">
                {positionIcons[index]} {positionLabels[index]} · {card.name}（
                {card.isUpright ? '正位' : '逆位'}）
              </Text>

              {/* 关键词 */}
              {detail?.keywords && (
                <Text className="result-three-page__section-keywords">
                  关键词：{detail.keywords}
                </Text>
              )}

              {/* 牌义 */}
              {detail?.meaning && (
                <Text className="result-three-page__section-meaning">
                  {detail.meaning}
                </Text>
              )}

              {/* AI 解读（占位，后续接流式输出） */}
              <Text className="result-three-page__section-content">
                {streamingInterpretation
                  ? `（${positionLabels[index]}的解读内容将在此显示）`
                  : '等待 AI 解读...'}
              </Text>
            </View>
          )
        })}

        {/* 综合建议 */}
        <View className="result-three-page__summary">
          <Text className="result-three-page__summary-title">✦ 综合建议</Text>
          <Text className="result-three-page__summary-content">
            综合三张牌的能量走向，给出整体建议...
          </Text>

          <Text className="result-three-page__disclaimer">
            以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。
          </Text>
        </View>

        {/* 操作按钮 */}
        <View className="result-three-page__actions">
          <View className="result-three-page__btn-row">
            <View className="result-three-page__retry-btn" onClick={handleRetry}>
              <Text className="result-three-page__retry-text">再来一次</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ResultThreePage
