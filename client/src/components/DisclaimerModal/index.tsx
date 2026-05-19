import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState, useRef, useCallback } from 'react'

import './index.scss'

/**
 * 免责协议弹窗组件
 * 首次使用强制展示，必须滚动到底才可同意
 */

interface DisclaimerModalProps {
  /** 是否显示 */
  visible: boolean
  /** 同意回调 */
  onAgree: () => void
  /** 不同意回调 */
  onDisagree: () => void
}

const DISCLAIMER_TEXT = `欢迎使用灵谕！

在使用本产品前，请您仔细阅读以下内容：

1. 本产品是一款基于 AI 的塔罗牌解读娱乐应用。所有解读内容均由人工智能生成，仅供参考和娱乐，不具有任何预测未来的功能。

2. 本产品不对解读结果的准确性、完整性或适用性作任何承诺或保证。用户应基于自身判断做出决策，不应将 AI 解读作为任何重要决策的依据。

3. 本产品不适用于 18 岁以下的未成年人。如果您未满 18 周岁，请勿使用本产品。

4. 本产品不提供任何形式的医疗、法律、财务、心理咨询等专业建议。如您有上述需求，请咨询相关专业人士。

5. 用户在使用本产品过程中产生的一切行为及其后果，均由用户自行承担，本产品不承担任何责任。

6. 本产品可能包含指向第三方服务的链接或内容，我们不对第三方服务的安全性、准确性或内容负责。

7. 我们重视您的隐私保护。您在使用本产品时提供的个人信息将按照《隐私政策》进行保护。

8. 本协议内容可能因产品更新而调整，请用户定期查看最新版本。

如果您继续使用本产品，即表示您已阅读、理解并同意上述条款。

感谢您的理解与支持！`

const DisclaimerModal: FC<DisclaimerModalProps> = ({
  visible,
  onAgree,
  onDisagree,
}) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  /** 检测是否滚动到底部 */
  const handleScroll = useCallback((e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.detail
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setScrolledToBottom(true)
    }
  }, [])

  if (!visible) return null

  return (
    <View className="disclaimer-modal">
      {/* 蒙层 */}
      <View className="disclaimer-modal__overlay" />

      {/* 弹窗容器 */}
      <View className="disclaimer-modal__container">
        <Text className="disclaimer-modal__title">使用须知 & 免责协议</Text>

        <ScrollView
          className="disclaimer-modal__content"
          scrollY
          onScroll={handleScroll}
          scrollWithAnimation
        >
          <Text className="disclaimer-modal__text">{DISCLAIMER_TEXT}</Text>
        </ScrollView>

        {/* 底部按钮 */}
        <View className="disclaimer-modal__actions">
          <View
            className={`disclaimer-modal__agree ${scrolledToBottom ? '' : 'disclaimer-modal__agree--disabled'}`}
            onClick={scrolledToBottom ? onAgree : undefined}
          >
            <Text className="disclaimer-modal__agree-text">
              我已阅读并同意
            </Text>
          </View>
          <Text className="disclaimer-modal__disagree" onClick={onDisagree}>
            不同意
          </Text>
        </View>
      </View>
    </View>
  )
}

export default DisclaimerModal
