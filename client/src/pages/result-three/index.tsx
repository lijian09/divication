import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect, useRef } from 'react'

import StarBackground from '@components/StarBackground'
import AiLoading from '@components/AiLoading'
import TarotCard from '@components/TarotCard'
import TypewriterText from '@components/TypewriterText'
import { useDivinationStore } from '@store/index'
import { getCardDetail } from '@services/card'
import { interpretDivination } from '@services/divination'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 结果页 - 三牌阵
 * 展示三张牌牌义 + AI 解读
 * 由于云函数返回整段内容，前端按过去/现在/未来关键词做智能分段
 */
const ResultThreePage: FC = () => {
  const {
    selectedCards,
    category,
    question,
    spreadType,
    recordId,
    interpretation,
    interpretationModel,
    isInterpretationDone,
    interpretationError,
    setInterpretation,
    setInterpretationError,
  } = useDivinationStore()

  const [isLoading, setIsLoading] = useState(!isInterpretationDone)
  const [isTimeout, setIsTimeout] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})
  const positionLabels = ['过去', '现在', '未来']
  const positionIcons = ['☽', '★', '✦']
  const calledRef = useRef(false)

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

  /** 触发 AI 解读 */
  useEffect(() => {
    if (calledRef.current || !recordId || selectedCards.length === 0) return
    calledRef.current = true

    const doInterpret = async () => {
      try {
        setIsLoading(true)
        const result = await interpretDivination({
          recordId,
          questionCategory: category,
          questionText: question,
          spreadType: spreadType || 'three',
          cards: selectedCards.map((c, i) => ({
            card_id: c.id,
            position: i + 1,
            is_reversed: !c.isUpright,
          })),
        })

        setInterpretation(result.content, result.model)
      } catch (err: any) {
        console.error('[DEBUG] AI 解读失败:', err.message)
        setInterpretationError(err.message || '解读失败')
      } finally {
        setIsLoading(false)
      }
    }

    doInterpret()

    const timeoutTimer = setTimeout(() => setIsTimeout(true), 15000)
    return () => clearTimeout(timeoutTimer)
  }, [recordId])

  /** 切换展开/收起 */
  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  /** 从整段解读中提取对应位置的段落 */
  const getSectionContent = (index: number): string | null => {
    if (!interpretation) return null

    const label = positionLabels[index]
    // 尝试按 "过去/现在/未来" 标题分割
    const sectionRegex = new RegExp(
      `[#*]*\\s*${label}[：:]*\\s*\\n*([\\s\\S]*?)(?=\\n[#*]*\\s*(?:${positionLabels.filter((_, i) => i !== index).join('|')}|综合|总结|---))`,
      'i',
    )
    const match = interpretation.match(sectionRegex)
    return match ? match[1].trim() : null
  }

  /** 提取综合建议部分 */
  const getSummaryContent = (): string | null => {
    if (!interpretation) return null
    const summaryRegex = /[#*]*\s*(?:综合|总结)[：:]*\s*\n*([\s\S]*?)(?=\n---|$)/i
    const match = interpretation.match(summaryRegex)
    return match ? match[1].trim() : null
  }

  const handleRetry = () => {
    useDivinationStore.getState().reset()
    Taro.redirectTo({ url: ROUTES.QUESTION_SELECT })
  }

  if (isLoading) {
    return (
      <View className="result-three-page">
        <StarBackground />
        <AiLoading isTimeout={isTimeout} onCancel={() => Taro.navigateBack()} />
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

        {/* AI 解读出错 */}
        {interpretationError && (
          <View className="result-three-page__error">
            <Text className="result-three-page__error-text">
              解读暂时不可用：{interpretationError}
            </Text>
            <Text
              className="result-three-page__error-retry"
              onClick={() => {
                calledRef.current = false
                setInterpretationError('')
                setIsLoading(true)
                setIsTimeout(false)
              }}
            >
              点击重试
            </Text>
          </View>
        )}

        {/* 分段牌义 + 解读 */}
        {selectedCards.map((card, index) => {
          const detail = cardDetails[index]
          const sectionContent = getSectionContent(index)
          const isExpanded = expandedSections[index] ?? true

          return (
            <View key={card.id} className="result-three-page__section">
              <View
                className="result-three-page__section-header"
                onClick={() => toggleSection(index)}
              >
                <Text className="result-three-page__section-title">
                  {positionIcons[index]} {positionLabels[index]} &middot; {card.name}
                  （{card.isUpright ? '正位' : '逆位'}）
                </Text>
                <Text className="result-three-page__section-toggle">
                  {isExpanded ? '收起 ▲' : '展开 ▼'}
                </Text>
              </View>

              {isExpanded && (
                <>
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

                  {/* AI 解读分段 */}
                  {sectionContent && (
                    <TypewriterText
                      content={sectionContent}
                      speed={25}
                      className="result-three-page__section-typewriter"
                    />
                  )}
                </>
              )}
            </View>
          )
        })}

        {/* 综合建议 */}
        {interpretation && (
          <View className="result-three-page__summary">
            <Text className="result-three-page__summary-title">✦ 综合建议</Text>
            <TypewriterText
              content={getSummaryContent() || interpretation}
              speed={25}
              className="result-three-page__summary-typewriter"
            />

            {interpretationModel && (
              <Text className="result-three-page__model">
                解读模型：{interpretationModel === 'fallback' ? '预设' : interpretationModel}
              </Text>
            )}

            <Text className="result-three-page__disclaimer">
              以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。
            </Text>
          </View>
        )}

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
