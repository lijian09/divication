import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect, useCallback } from 'react'

import StarBackground from '@components/StarBackground'
import CardSpread from '@components/CardSpread'
import { useDivinationStore } from '@store/index'
import { useQuotaStore } from '@store/index'
import { drawCards } from '@services/divination'
import { ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 选牌页
 * 用户从牌堆中选择需要的牌
 * 单牌阵选 1 张，三牌阵选 3 张
 *
 * 流程：进入页面 → 调用后端抽牌 API → 用户点击牌堆 → 逐张翻开选中的牌
 */
const PickCardPage: FC = () => {
  const { spreadType, category, question, addSelectedCard, selectedCards, setStep, setRecordId } =
    useDivinationStore()
  const { fetchQuota } = useQuotaStore()
  const maxCount = spreadType === 'three' ? 3 : 1
  const isFull = selectedCards.length >= maxCount

  /** 后端返回的牌数据（用户不可见，逐步揭露） */
  const [drawnCards, setDrawnCards] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(true)
  const [error, setError] = useState('')

  /** 进入页面时调用后端抽牌 */
  useEffect(() => {
    const doDraw = async () => {
      try {
        setIsDrawing(true)
        const result = await drawCards({
          question_category: category,
          question_text: question,
          spread_type: spreadType || 'single',
        })

        setDrawnCards(result.cards)
        setRecordId(result.recordId)
        // 同步更新配额
        fetchQuota()
        console.log('[DEBUG] 抽牌成功，后端已扣减配额，类型:', result.quotaType)
      } catch (err: any) {
        console.error('[DEBUG] 抽牌失败:', err.message)
        setError(err.message || '抽牌失败，请重试')
      } finally {
        setIsDrawing(false)
      }
    }

    if (spreadType && question) {
      doDraw()
    }
  }, [])

  /** 点击牌堆，按顺序揭露一张牌 */
  const handleCardPick = useCallback(() => {
    if (isFull || isDrawing || drawnCards.length === 0) return

    const nextIndex = selectedCards.length
    if (nextIndex >= drawnCards.length) return

    const card = drawnCards[nextIndex]
    addSelectedCard({
      id: card.id,
      name: card.name,
      nameEn: card.nameEn,
      isUpright: !card.isReversed,
      keywords: typeof card.keywords === 'string' ? card.keywords.split(',') : card.keywords,
      imageUrl: card.imageUrl,
      position: maxCount === 3 ? (['past', 'present', 'future'][nextIndex] as any) : undefined,
    })
  }, [isFull, isDrawing, drawnCards, selectedCards.length, addSelectedCard, maxCount])

  /** 进入翻牌 */
  const handleReveal = () => {
    if (!isFull) return
    setStep('pick')
    Taro.navigateTo({ url: ROUTES.REVEAL })
  }

  /** 抽牌失败时返回重试 */
  const handleRetry = () => {
    Taro.navigateBack()
  }

  return (
    <View className="pick-card-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="pick-card-page__nav">
        <Text className="pick-card-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="pick-card-page__nav-title">选牌中</Text>
      </View>

      {/* 抽牌失败 */}
      {error && (
        <View className="pick-card-page__error">
          <Text className="pick-card-page__error-text">{error}</Text>
          <Text className="pick-card-page__error-retry" onClick={handleRetry}>
            点击重试
          </Text>
        </View>
      )}

      {/* 抽牌加载中 */}
      {isDrawing && !error && (
        <View className="pick-card-page__loading">
          <Text className="pick-card-page__loading-text">正在洗牌...</Text>
        </View>
      )}

      {/* 选中区域 */}
      {!isDrawing && !error && (
        <View className="pick-card-page__selected">
          <CardSpread
            type={spreadType || 'single'}
            cards={selectedCards.map((c) => ({ ...c, isRevealed: false }))}
            size="small"
          />
        </View>
      )}

      {/* 牌堆（点击选牌） */}
      {!isDrawing && !error && (
        <>
          <Text className="pick-card-page__hint">轻触选择牌面</Text>
          <View className="pick-card-page__deck" onClick={handleCardPick}>
            {Array.from({ length: 8 }, (_, i) => (
              <View
                key={i}
                className="pick-card-page__deck-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <View className="pick-card-page__deck-back">
                  <Text className="pick-card-page__deck-symbol">✦</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 底部操作栏 */}
      <View className="pick-card-page__action">
        <Text className="pick-card-page__action-count">
          已选 {selectedCards.length}/{maxCount}
        </Text>
        <View
          className={`pick-card-page__action-btn ${isFull ? '' : 'pick-card-page__action-btn--disabled'}`}
          onClick={isFull ? handleReveal : undefined}
        >
          <Text className="pick-card-page__action-btn-text">
            {isFull ? '翻牌 ▶' : isDrawing ? '洗牌中...' : '请选择牌'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PickCardPage
