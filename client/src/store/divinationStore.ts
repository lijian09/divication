import { create } from 'zustand'

/**
 * 牌阵类型
 */
type SpreadType = 'single' | 'three'

/**
 * 单张牌信息
 */
interface CardInfo {
  id: string
  name: string
  nameEn: string
  isUpright: boolean
  keywords: string[]
  imageUrl: string
  position?: 'past' | 'present' | 'future' // 三牌阵位置
}

/**
 * 占卜会话信息
 */
interface DivinationSession {
  sessionId: string
  question: string
  category: string
  spreadType: SpreadType
  cards: CardInfo[]
  interpretation: string
  createdAt: string
}

/**
 * 占卜状态管理
 * 管理占卜流程：问题选择 → 牌阵选择 → 洗牌 → 抽牌 → 解读
 */
interface DivinationState {
  /** 当前步骤 */
  step: 'idle' | 'question' | 'spread' | 'shuffle' | 'pick' | 'reveal' | 'result'
  /** 选中的问题分类 */
  category: string
  /** 用户问题 */
  question: string
  /** 牌阵类型 */
  spreadType: SpreadType | null
  /** 抽到的牌 */
  selectedCards: CardInfo[]
  /** 完整的占卜会话 */
  currentSession: DivinationSession | null
  /** AI 解读内容（流式） */
  streamingInterpretation: string
  /** 解读是否完成 */
  isInterpretationDone: boolean

  /** 设置当前步骤 */
  setStep: (step: DivinationState['step']) => void
  /** 设置问题 */
  setQuestion: (category: string, question: string) => void
  /** 设置牌阵类型 */
  setSpreadType: (type: SpreadType) => void
  /** 添加选中的牌 */
  addSelectedCard: (card: CardInfo) => void
  /** 重置选牌 */
  resetSelectedCards: () => void
  /** 设置流式解读 */
  setStreamingInterpretation: (text: string) => void
  /** 设置解读完成 */
  setInterpretationDone: (done: boolean) => void
  /** 完成占卜会话 */
  completeSession: (session: DivinationSession) => void
  /** 重置整个占卜流程 */
  reset: () => void
}

export const useDivinationStore = create<DivinationState>((set) => ({
  step: 'idle',
  category: '',
  question: '',
  spreadType: null,
  selectedCards: [],
  currentSession: null,
  streamingInterpretation: '',
  isInterpretationDone: false,

  setStep: (step) => set({ step }),

  setQuestion: (category, question) => set({ category, question }),

  setSpreadType: (type) => set({ spreadType: type }),

  addSelectedCard: (card) =>
    set((state) => ({ selectedCards: [...state.selectedCards, card] })),

  resetSelectedCards: () => set({ selectedCards: [] }),

  setStreamingInterpretation: (text) => set({ streamingInterpretation: text }),

  setInterpretationDone: (done) => set({ isInterpretationDone: done }),

  completeSession: (session) =>
    set({ currentSession: session, isInterpretationDone: true }),

  reset: () =>
    set({
      step: 'idle',
      category: '',
      question: '',
      spreadType: null,
      selectedCards: [],
      currentSession: null,
      streamingInterpretation: '',
      isInterpretationDone: false,
    }),
}))
