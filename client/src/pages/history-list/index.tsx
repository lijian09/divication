import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useState, useEffect, useCallback } from 'react'

import StarBackground from '@components/StarBackground'
import { getHistoryList } from '@services/divination'
import { CATEGORIES, ROUTES } from '@utils/constants'

import './index.scss'

/**
 * 历史记录列表页
 * 按时间倒序展示占卜历史记录
 * 支持分页加载
 */

interface HistoryItem {
  id: string
  question_category: string
  question_text: string
  spread_type: string
  cardCount: number
  status: string
  created_at: any
}

/** 获取分类信息 */
const getCategoryInfo = (key: string) => {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[4]
}

/** 格式化时间 */
const formatDate = (dateObj: any) => {
  if (!dateObj) return ''
  const date = new Date(dateObj)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

const HistoryListPage: FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)

  /** 加载列表 */
  const loadList = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const result = await getHistoryList({ page: pageNum, pageSize: 20 })
      const data = result as any

      if (append) {
        setItems((prev) => [...prev, ...(data.items || [])])
      } else {
        setItems(data.items || [])
        setIsEmpty(!data.items || data.items.length === 0)
      }

      setTotalPages(data.totalPages || 0)
    } catch (err: any) {
      console.error('[DEBUG] 获取历史记录失败:', err.message)
      if (!append) setIsEmpty(true)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadList(1)
  }, [])

  /** 加载更多 */
  const handleLoadMore = () => {
    if (isLoadingMore || page >= totalPages) return
    const nextPage = page + 1
    setPage(nextPage)
    loadList(nextPage, true)
  }

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

      {isLoading ? (
        <View className="history-list-page__loading">
          <Text className="history-list-page__loading-text">加载中...</Text>
        </View>
      ) : isEmpty ? (
        /* 空状态 */
        <View className="history-list-page__empty">
          <View className="history-list-page__empty-icon">
            <Text className="history-list-page__empty-icon-text">&#x1F0CF;</Text>
          </View>
          <Text className="history-list-page__empty-title">还没有占卜记录</Text>
          <Text className="history-list-page__empty-desc">
            抽一张牌，开启你的第一次解读吧
          </Text>
          <View
            className="history-list-page__empty-cta"
            onClick={() => Taro.switchTab({ url: ROUTES.HOME })}
          >
            <Text className="history-list-page__empty-cta-text">去占卜 &#10022;</Text>
          </View>
        </View>
      ) : (
        /* 记录列表 */
        <ScrollView
          className="history-list-page__list"
          scrollY
          onScrollToLower={handleLoadMore}
        >
          {items.map((item) => {
            const cat = getCategoryInfo(item.question_category)
            return (
              <View
                key={item.id}
                className="history-list-page__item"
                onClick={() => handleItemClick(item.id)}
              >
                <Text className="history-list-page__item-date">
                  {formatDate(item.created_at)}
                </Text>
                <Text
                  className="history-list-page__item-category"
                  style={{ color: cat.color }}
                >
                  {cat.icon} {cat.label}
                </Text>
                <Text className="history-list-page__item-question">
                  {item.question_text}
                </Text>
                <Text className="history-list-page__item-spread">
                  {item.spread_type === 'three' ? '三牌阵' : '单牌阵'} &middot;
                  {item.cardCount} 张牌
                  {item.status === 'completed' ? '' : ' &middot; 解读中'}
                </Text>
              </View>
            )
          })}

          {/* 加载更多 */}
          {isLoadingMore && (
            <View className="history-list-page__loading-more">
              <Text className="history-list-page__loading-more-text">加载更多...</Text>
            </View>
          )}

          {page >= totalPages && items.length > 0 && (
            <View className="history-list-page__no-more">
              <Text className="history-list-page__no-more-text">— 没有更多了 —</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default HistoryListPage
