import { View, Text } from '@tarojs/components'
import { FC, useEffect, useRef, useState } from 'react'

import './index.scss'

/**
 * AI 解读加载动画组件
 * 星形旋转 + 诗句轮播 + 模拟进度条
 */

interface AiLoadingProps {
  /** 进度百分比（0-100），传入则使用外部进度 */
  progress?: number
  /** 是否超时 */
  isTimeout?: boolean
  /** 取消回调 */
  onCancel?: () => void
}

/** 预设诗句 */
const QUOTES = [
  { text: '命运不是等来的，是走出来的。', author: '佚名' },
  { text: '星星发亮，是为了让每一个人有一天都能找到属于自己的星星。', author: '安东尼·圣-埃克苏佩里' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
  { text: '当你凝视深渊时，深渊也在凝视你。', author: '尼采' },
  { text: '世界上只有一种英雄主义，就是认清生活后依然热爱生活。', author: '罗曼·罗兰' },
]

const AiLoading: FC<AiLoadingProps> = ({
  progress: externalProgress,
  isTimeout = false,
  onCancel,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [simProgress, setSimProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()

  // 诗句轮播：每 3 秒切换
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 3000)
    return () => clearInterval(quoteTimer)
  }, [])

  // 模拟进度（外部未传入时）
  useEffect(() => {
    if (externalProgress !== undefined) return

    timerRef.current = setInterval(() => {
      setSimProgress((prev) => {
        // 前 80% 快速填充，后 20% 缓慢
        if (prev < 80) return prev + Math.random() * 5
        if (prev < 95) return prev + Math.random() * 1
        return prev
      })
    }, 500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [externalProgress])

  const displayProgress = Math.min(
    98,
    Math.round(externalProgress !== undefined ? externalProgress : simProgress),
  )

  return (
    <View className="ai-loading">
      {/* 星形旋转 */}
      <View className="ai-loading__star">
        <Text className="ai-loading__star-icon">✦</Text>
      </View>

      {/* 主提示文字 */}
      <Text className="ai-loading__title">正在为你解读</Text>

      {/* 诗句轮播 */}
      {!isTimeout ? (
        <View className="ai-loading__quote">
          <Text className="ai-loading__quote-text">"{QUOTES[quoteIndex].text}"</Text>
          <Text className="ai-loading__quote-author">—— {QUOTES[quoteIndex].author}</Text>
        </View>
      ) : (
        <View className="ai-loading__timeout">
          <Text className="ai-loading__timeout-text">解读生成中，用时较长</Text>
          <Text className="ai-loading__timeout-text">请稍候...</Text>
          {onCancel && (
            <Text className="ai-loading__cancel" onClick={onCancel}>
              取消并返回
            </Text>
          )}
        </View>
      )}

      {/* 进度条 */}
      <View className="ai-loading__progress">
        <View
          className="ai-loading__progress-bar"
          style={{ width: `${displayProgress}%` }}
        />
      </View>

      {/* 预期时间提示 */}
      <Text className="ai-loading__hint">
        解读生成通常需要 5~10 秒，请耐心等待...
      </Text>
    </View>
  )
}

export default AiLoading
