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
 * 结果页 - 单牌
 * 展示牌义 + AI 解读结果
 * 进入页面时自动触发 AI 解读
 */
const ResultSinglePage: FC = () => {
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

  const card = selectedCards[0]
  const [isLoading, setIsLoading] = useState(!isInterpretationDone)
  const [isTimeout, setIsTimeout] = useState(false)
  const [cardDetail, setCardDetail] = useState<{
    keywords: string
    meaning: string
  } | null>(null)
  const calledRef = useRef(false)

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
        setCardDetail({
          keywords: card.keywords?.join(' · ') || '',
          meaning: '',
        })
      }
    }

    fetchDetail()
  }, [card?.id])

  /** 触发 AI 解读 */
  useEffect(() => {
    if (calledRef.current || !recordId || !card) return
    calledRef.current = true

    const doInterpret = async () => {
      try {
        setIsLoading(true)
        const result = await interpretDivination({
          recordId,
          questionCategory: category,
          questionText: question,
          spreadType: spreadType || 'single',
          cards: [
            {
              card_id: card.id,
              position: 1,
              is_reversed: !card.isUpright,
            },
          ],
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

    // 15 秒超时提示
    const timeoutTimer = setTimeout(() => setIsTimeout(true), 15000)
    return () => clearTimeout(timeoutTimer)
  }, [recordId])

  /** 再来一次 */
  const handleRetry = () => {
    useDivinationStore.getState().reset()
    Taro.redirectTo({ url: ROUTES.QUESTION_SELECT })
  }

  /** 查看牌义详解 */
  const handleViewCardDetail = () => {
    if (card?.id) {
      // TODO: 跳转到牌义详情页（路由待添加）
      Taro.showToast({ title: '牌义详情页开发中', icon: 'none' })
    }
  }

  if (isLoading) {
    return (
      <View className="result-single-page">
        <StarBackground />
        <AiLoading isTimeout={isTimeout} onCancel={() => Taro.navigateBack()} />
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
          &ldquo;{card?.name}&rdquo; &middot; {card?.isUpright ? '正位' : '逆位'}
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
          <Text className="result-single-page__interpretation-label">
            AI 解读
            {interpretationModel && (
              <Text className="result-single-page__interpretation-model">
                &nbsp;({interpretationModel === 'fallback' ? '预设' : interpretationModel})
              </Text>
            )}
          </Text>

          {interpretationError ? (
            <View className="result-single-page__error">
              <Text className="result-single-page__error-text">
                解读暂时不可用：{interpretationError}
              </Text>
              <Text
                className="result-single-page__error-retry"
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
          ) : (
            <View className="result-single-page__interpretation-card">
              <TypewriterText
                content={interpretation || '（暂无解读内容）'}
                speed={25}
              />
            </View>
          )}
        </View>

        {/* 查看牌义 */}
        <View className="result-single-page__view-card-btn" onClick={handleViewCardDetail}>
          <Text className="result-single-page__view-card-text">
            &#x1F4D6; 查看牌义详解
          </Text>
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
