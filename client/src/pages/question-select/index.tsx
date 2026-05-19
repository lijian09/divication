import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC, useState } from 'react'

import StarBackground from '@components/StarBackground'
import CategoryTag from '@components/CategoryTag'
import { useDivinationStore } from '@store/index'
import { ROUTES, CATEGORIES, PRESET_QUESTIONS } from '@utils/constants'

import './index.scss'

/**
 * 问题选择页
 * 让用户选择或输入占卜问题方向
 * 第 1 步（进度 1/3）
 */
const QuestionSelectPage: FC = () => {
  const router = useRouter()
  const { setQuestion, setStep } = useDivinationStore()

  const [selectedCategory, setSelectedCategory] = useState(
    (router.params.category as string) || '',
  )
  const [selectedPreset, setSelectedPreset] = useState('')
  const [customInput, setCustomInput] = useState('')

  const hasQuestion = !!selectedPreset || !!customInput.trim()

  /** 选择分类 */
  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key)
    setSelectedPreset('')
    setCustomInput('')
  }

  /** 选择预设问题 */
  const handlePresetSelect = (question: string) => {
    setSelectedPreset(question)
    setCustomInput('')
  }

  /** 输入自定义问题 */
  const handleInput = (e: any) => {
    const value = e.detail.value
    if (value.length <= 100) {
      setCustomInput(value)
      setSelectedPreset('')
    }
  }

  /** 下一步 */
  const handleNext = () => {
    const question = selectedPreset || customInput.trim()
    if (!question) return

    setQuestion(selectedCategory, question)
    setStep('question')
    Taro.navigateTo({ url: ROUTES.SPREAD_SELECT })
  }

  const presetQuestions = PRESET_QUESTIONS[selectedCategory] || []

  return (
    <View className="question-page">
      <StarBackground />

      {/* 导航栏 */}
      <View className="question-page__nav">
        <Text className="question-page__nav-back" onClick={() => Taro.navigateBack()}>
          &lt; 返回
        </Text>
        <Text className="question-page__nav-title">选择问题</Text>
        <Text className="question-page__nav-progress">1/3 ●○○</Text>
      </View>

      <View className="question-page__content">
        {/* 分类选择 */}
        <Text className="question-page__section-title">你想问什么方向？</Text>
        <View className="question-page__categories">
          {CATEGORIES.map((cat) => (
            <CategoryTag
              key={cat.key}
              category={cat.key}
              label={cat.label}
              icon={cat.icon}
              color={cat.color}
              selected={selectedCategory === cat.key}
              onClick={() => handleCategorySelect(cat.key)}
            />
          ))}
        </View>

        {/* 预设问题 */}
        {selectedCategory && presetQuestions.length > 0 && (
          <View className="question-page__presets">
            {presetQuestions.map((q) => (
              <View
                key={q}
                className={`question-page__preset ${selectedPreset === q ? 'question-page__preset--active' : ''}`}
                onClick={() => handlePresetSelect(q)}
              >
                <Text className="question-page__preset-text">○ {q}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 自定义输入 */}
        <Text className="question-page__section-label">或者自己输入</Text>
        <View className="question-page__input-wrap">
          <Textarea
            className="question-page__input"
            placeholder="在这里输入你的问题..."
            placeholderClass="question-page__placeholder"
            value={customInput}
            onInput={handleInput}
            maxlength={100}
            autoHeight
          />
          <Text className={`question-page__counter ${customInput.length > 90 ? 'question-page__counter--warn' : ''}`}>
            {customInput.length}/100
          </Text>
        </View>
      </View>

      {/* 下一步按钮 */}
      <View
        className={`question-page__next ${hasQuestion ? '' : 'question-page__next--disabled'}`}
        onClick={hasQuestion ? handleNext : undefined}
      >
        <Text className="question-page__next-text">下一步</Text>
      </View>
    </View>
  )
}

export default QuestionSelectPage
