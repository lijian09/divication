import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC, useState, useEffect } from 'react'

import StarBackground from '@components/StarBackground'
import TarotCard from '@components/TarotCard'
import { getHistoryDetail } from '@services/divination'
import { getCardDetail } from '@services/card'
import { CATEGORIES } from '@utils/constants'

import './index.scss'

/**
 * 历史记录详情页
 * 展示单条占卜记录的完整内容：牌面 + AI 解读
 */

interface CardData {
  card_id: string
  position: number
  position_name?: string
  is_reversed: boolean
  name_cn?: string
  name_en?: string
}

interface InterpretationData {
  content: string
  model: string
  created_at: any
}

interface DetailData {
  id: string
  question_category: string
  question_text: string
  spread_type: string
  cards: CardData[]
  status: string
  interpretation: InterpretationData | null
  created_at: any
}

/** 获取分类信息 */
const getCategoryInfo = (key: string) => {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[4]
}

/** 格式化时间 */
const formatDateTime = (dateObj: any) => {
  if (!dateObj) return ''
  const date = new Date(dateObj)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${d}日 ${h}:${min}`
}

const HistoryDetailPage: FC = () => {
  const router = useRouter()
  const recordId = router.params.id

  const [detail, setDetail] = useState<DetailData | null>(null)
  const [cardNames, setCardNames] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  /** 加载详情 */
  useEffect(() => {
    if (!recordId) return

    const loadDetail = async () => {
      try {
        const result = (await getHistoryDetail(recordId)) as any
        setDetail(result)

        // 批量查询牌名
        if (result.cards?.length > 0) {
          const nameMap: Record<string, string> = {}
          await Promise.all(
            result.cards.map(async (card: CardData) => {
              try {
                const detail = await getCardDetail(card.card_id, card.is_reversed)
                nameMap[card.card_id] = detail.nameCn
              } catch {
                nameMap[card.card_id] = card.name_cn || '未知'
              }
            }),
          )
          setCardNames(nameMap)
        }
      } catch (err: any) {
        console.error('[DEBUG] 获取记录详情失败:', err.message)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setIsLoading(false)
      }
    }

    loadDetail()
  }, [recordId])

  if (isLoading) {
    return (
      <View className="history-detail-page">
        <StarBackground />
        <View className="history-detail-page__loading">
          <Text className="history-detail-page__loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className="history-detail-page">
        <StarBackground />
        <View className="history-detail-page__error">
          <Text className="history-detail-page__error-text">记录不存在</Text>
          <Text
            className="history-detail-page__error-back"
            onClick={() => Taro.navigateBack()}
          >
            返回
          </Text>
        </View>
      </View>
    )
  }

  const cat = getCategoryInfo(detail.question_category)
  const positionLabels = detail.spread_type === 'three'
    ? ['过去', '现在', '未来']
    : ['']

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
          {formatDateTime(detail.created_at)}
        </Text>
        <Text className="history-detail-page__meta" style={{ color: cat.color }}>
          {cat.icon} {cat.label} &middot;
          {detail.spread_type === 'three' ? '三牌阵' : '单牌阵'}
        </Text>

        {/* 问题卡片 */}
        <View className="history-detail-page__question">
          <Text className="history-detail-page__question-label">你的问题：</Text>
          <Text className="history-detail-page__question-text">
            {detail.question_text}
          </Text>
        </View>

        {/* 牌面展示 */}
        <View className="history-detail-page__cards">
          {detail.cards?.map((card, index) => (
            <View key={card.card_id} className="history-detail-page__card-item">
              <TarotCard
                name={cardNames[card.card_id] || card.name_cn || '?'}
                isUpright={!card.is_reversed}
                size={detail.cards.length > 1 ? 'medium' : 'large'}
                faceDown={false}
              />
              {positionLabels[index] && (
                <Text className="history-detail-page__card-position">
                  {positionLabels[index]}
                </Text>
              )}
              <Text className="history-detail-page__card-name">
                {cardNames[card.card_id] || card.name_cn || '未知'}
              </Text>
              <Text className="history-detail-page__card-direction">
                {card.is_reversed ? '逆位' : '正位'}
              </Text>
            </View>
          ))}
        </View>

        {/* AI 解读 */}
        {detail.interpretation ? (
          <View className="history-detail-page__interpretation">
            <Text className="history-detail-page__interpretation-title">
              AI 解读
              {detail.interpretation.model && (
                <Text className="history-detail-page__interpretation-model">
                  &nbsp;({detail.interpretation.model === 'fallback' ? '预设' : detail.interpretation.model})
                </Text>
              )}
            </Text>
            <Text className="history-detail-page__interpretation-content">
              {detail.interpretation.content}
            </Text>
            <Text className="history-detail-page__disclaimer">
              以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。
            </Text>
          </View>
        ) : detail.status === 'pending' ? (
          <View className="history-detail-page__pending">
            <Text className="history-detail-page__pending-text">
              解读生成中，请稍后再查看...
            </Text>
          </View>
        ) : (
          <View className="history-detail-page__no-interpretation">
            <Text className="history-detail-page__no-interpretation-text">
              暂无解读内容
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default HistoryDetailPage
