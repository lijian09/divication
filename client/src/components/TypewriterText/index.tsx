import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useRef } from 'react'

import './index.scss'

/**
 * 打字机效果组件 — F-508
 * 逐字输出文字 + 光标闪烁
 * 支持自动滚动到底部
 */

interface TypewriterTextProps {
  /** 完整文本内容 */
  content: string
  /** 每字间隔（ms），默认 30 */
  speed?: number
  /** 是否立即显示全部（跳过动画） */
  instant?: boolean
  /** 输出完成回调 */
  onComplete?: () => void
  /** 自定义类名 */
  className?: string
}

const TypewriterText: FC<TypewriterTextProps> = ({
  content,
  speed = 30,
  instant = false,
  onComplete,
  className = '',
}) => {
  const [displayedLength, setDisplayedLength] = useState(instant ? content.length : 0)
  const [isComplete, setIsComplete] = useState(instant)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (instant || !content) {
      setDisplayedLength(content.length)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // 重置状态
    setDisplayedLength(0)
    setIsComplete(false)

    let current = 0
    timerRef.current = setInterval(() => {
      current += 1
      setDisplayedLength(current)

      if (current >= content.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [content, speed, instant])

  const displayedText = content.slice(0, displayedLength)

  return (
    <View className={`typewriter ${className}`}>
      <Text className="typewriter__text">{displayedText}</Text>
      {!isComplete && <View className="typewriter__cursor" />}
    </View>
  )
}

export default TypewriterText
