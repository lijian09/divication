/**
 * AI 塔罗解读云函数
 *
 * 接口: interpret
 *   非流式解读（云函数不支持 SSE）
 *   Claude → GPT → 预设模板 三级降级
 *
 * 注意：云函数超时 60s，Claude API 需在 45s 内返回
 */
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// ========== 问题类别映射 ==========
const CATEGORY_LABELS = {
  love: '爱情',
  career: '事业',
  finance: '财运',
  health: '健康',
  general: '综合运势',
}

// ========== 预设模板解读（降级方案）==========
const PRESET_INTERPRETATIONS = {
  love: [
    '这张牌暗示你目前的感情状态正处在一个关键的转折点。牌面的能量提醒你，真诚的沟通是打开彼此心门的钥匙。试着放下防备，用你最真实的一面去面对这段关系。感情的发展需要双方共同的投入和耐心，保持信心，美好的变化正在路上。',
    '牌面显示你的感情之路虽然可能面临一些小考验，但这些都是成长的契机。记住，每段感情都会经历磨合期。保持开放的心态，倾听内心的声音，你会找到属于自己的答案。',
  ],
  career: [
    '这张牌为你的职业发展带来了一个重要的信号。当前你可能正面临一个选择或转变的节点。牌面鼓励你相信自己的能力和判断力，勇敢地迈出下一步。新的机遇往往出现在你最意想不到的时刻。',
    '牌面能量提示你，目前的工作状态可能需要一些调整。不要害怕改变，有时候一个小小的方向调整就能带来巨大的突破。专注于提升自己的核心竞争力，机会自然会来敲门。',
  ],
  finance: [
    '从牌面的能量来看，你的财运正处于一个需要审慎规划的阶段。这张牌提醒你，稳定的积累比冒险的投机更能带来长久的收益。合理安排收支，保持耐心，财务状况会逐步改善。',
    '牌面暗示近期可能会有一些小的财务波动，但不必过于担心。这是一个学习理财的好时机。审慎评估每一个财务决策，量入为出，你会发现自己的经济状况在不知不觉中变得更好。',
  ],
  health: [
    '这张牌提醒你关注身心的平衡。牌面的能量暗示你可能最近有些疲惫或压力较大。试着给自己一些放松的时间，保持规律的作息和适当的运动。身体是革命的本钱，好好照顾自己。',
    '牌面显示你的整体健康状况良好，但需要注意劳逸结合。有时候，内心的平静比外在的忙碌更重要。保持积极乐观的心态，健康自然会与你同行。',
  ],
  general: [
    '这张牌为你揭示了当前的整体能量状态。牌面暗示你正站在一个新的起点上，前方有无限的可能等待你去探索。保持好奇心和勇气，你的人生旅程正在迎来一个重要的阶段。',
    '牌面的能量温和而有力，提醒你相信自己的直觉和判断。当前的你可能正在经历一些变化，但这些都是成长的必经之路。接纳变化，拥抱未知，你会发现自己比想象中更加强大。',
  ],
}

// ========== 敏感词过滤 ==========
const DANGER_WORDS = [
  { pattern: /一定会/g, replacement: '可能会' },
  { pattern: /绝对不会/g, replacement: '可能不太会' },
  { pattern: /100%/g, replacement: '很大概率' },
  { pattern: /保证/g, replacement: '倾向于' },
  { pattern: /必然/g, replacement: '大概率' },
  { pattern: /注定/g, replacement: '机缘巧合' },
  { pattern: /命中注定/g, replacement: '缘分使然' },
]

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, recordId, questionCategory, questionText, spreadType, cards } = event

  try {
    if (action !== 'interpret') {
      return { code: -1, message: '未知操作' }
    }

    if (!cards || cards.length === 0) {
      return { code: -1, message: '牌信息不能为空' }
    }

    // 1. 查询牌义
    const cardDetails = await queryCardDetails(cards)

    // 2. 组装 Prompt
    const prompt = buildPrompt(questionCategory, questionText, spreadType, cardDetails)

    // 3. 调用 AI（三级降级）
    const startTime = Date.now()
    const { content, model, status } = await callAiWithFallback(prompt, questionCategory)
    const latencyMs = Date.now() - startTime

    // 4. 安全过滤
    const filteredContent = filterContent(content)
    const finalContent = appendDisclaimer(filteredContent)

    // 5. 保存解读记录
    await db.collection('interpretations').add({
      data: {
        record_id: recordId,
        _openid: OPENID,
        prompt_text: prompt,
        raw_content: content,
        filtered_content: finalContent,
        model,
        status,
        latency_ms: latencyMs,
        created_at: db.serverDate(),
      },
    })

    // 6. 更新占卜记录状态
    await db.collection('records')
      .where({ _id: recordId })
      .update({ data: { status: 'completed' } })

    return {
      code: 0,
      data: {
        content: finalContent,
        cardNames: cardDetails.map(c => c.nameCn),
        model,
        status,
      },
    }
  } catch (err) {
    console.error('[ai-interpret] 错误:', err)

    // 即使异常也保存失败记录
    try {
      await db.collection('interpretations').add({
        data: {
          record_id: recordId,
          _openid: OPENID,
          prompt_text: '',
          raw_content: '',
          filtered_content: '',
          model: 'error',
          status: 'error',
          error_message: err.message,
          created_at: db.serverDate(),
        },
      })
      await db.collection('records')
        .where({ _id: recordId })
        .update({ data: { status: 'failed' } })
    } catch (_) {}

    return { code: -1, message: '解读服务暂时不可用' }
  }
}

/**
 * 查询牌义详情
 */
async function queryCardDetails(cards) {
  const results = []
  for (const card of cards) {
    const res = await db.collection('cards')
      .where({ card_id: card.card_id })
      .limit(1)
      .get()

    if (res.data.length > 0) {
      const c = res.data[0]
      const isReversed = card.is_reversed
      results.push({
        ...card,
        nameCn: c.name_cn,
        nameEn: c.name_en,
        arcanaType: c.arcana_type,
        suit: c.suit,
        keywords: isReversed ? c.reversed_keywords : c.upright_keywords,
        meaning: isReversed ? c.reversed_meaning : c.upright_meaning,
      })
    }
  }
  return results
}

/**
 * 组装 Prompt
 */
function buildPrompt(questionCategory, questionText, spreadType, cardDetails) {
  const categoryLabel = CATEGORY_LABELS[questionCategory] || questionCategory

  const systemPrompt = `你是一位温暖而专业的塔罗牌解读师，拥有深厚的塔罗知识和直觉力。
你的解读风格温暖、富有同理心，同时保持客观和建设性。

## 解读规则
1. 严格基于牌面含义和用户问题进行解读，不要编造牌义
2. 语气温暖但保持专业，像一位知心朋友在分享智慧
3. 避免给出绝对的预测，强调塔罗是提供指引而非定论
4. 给出具体、可操作的建议，不要泛泛而谈
5. 控制解读长度在 200-400 字之间
6. 不要使用"命中注定"、"必然"等绝对化表述
7. 不要提供医疗、法律、投资等专业领域建议`

  const positionNames = spreadType === 'single' ? [''] : ['过去', '现在', '未来']

  const cardsDescription = cardDetails
    .map((card, i) => {
      const pos = positionNames[i] ? `（${positionNames[i]}）` : ''
      const suitInfo = card.suit ? ` · ${card.suit}` : ''
      return `第 ${i + 1} 张：${card.nameCn}（${card.nameEn}）${pos}
  ${card.is_reversed ? '逆位' : '正位'}${suitInfo}
  关键词：${card.keywords}
  牌义：${card.meaning}`
    })
    .join('\n\n')

  const spreadDesc = spreadType === 'three' ? '三牌阵（过去/现在/未来）' : '单牌阵'

  const userPrompt = `【用户问题】
类别：${categoryLabel}
问题：${questionText}
牌阵：${spreadDesc}

【抽到的牌】
${cardsDescription}

请根据以上牌面信息和用户问题，给出详细的塔罗解读。`

  return `${systemPrompt}\n\n${userPrompt}`
}

/**
 * 三级降级调用：Claude → GPT → 预设模板
 */
async function callAiWithFallback(prompt, questionCategory) {
  // 第一级：Claude
  try {
    const result = await callClaude(prompt)
    if (result) return { content: result, model: 'claude', status: 'success' }
  } catch (err) {
    console.warn('[ai] Claude 失败:', err.message)
  }

  // 第二级：GPT
  try {
    const result = await callGpt(prompt)
    if (result) return { content: result, model: 'gpt', status: 'success' }
  } catch (err) {
    console.warn('[ai] GPT 失败:', err.message)
  }

  // 第三级：预设模板
  console.warn('[ai] 全部 AI 失败，使用预设模板')
  const templates = PRESET_INTERPRETATIONS[questionCategory] || PRESET_INTERPRETATIONS.general
  const content = templates[Math.floor(Math.random() * templates.length)]
  return { content, model: 'fallback', status: 'fallback' }
}

/**
 * 调用 Claude Messages API
 */
async function callClaude(prompt) {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) return null

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'

  const parts = prompt.split('\n\n')
  const systemPart = parts[0]
  const userPart = parts.slice(1).join('\n\n')

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      max_tokens: 2048,
      system: systemPart,
      messages: [{ role: 'user', content: userPart }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 45000, // 云函数 60s 限制，预留 15s 给后续处理
    },
  )

  return response.data?.content?.[0]?.text || null
}

/**
 * 调用 GPT API（降级）
 */
async function callGpt(prompt) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 45000,
    },
  )

  return response.data?.choices?.[0]?.message?.content || null
}

/**
 * 内容安全过滤
 */
function filterContent(content) {
  let filtered = content
  for (const rule of DANGER_WORDS) {
    filtered = filtered.replace(rule.pattern, rule.replacement)
  }
  return filtered
}

/**
 * 追加免责声明
 */
function appendDisclaimer(content) {
  return `${content}\n\n---\n*以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。请理性对待塔罗牌的指引，生活的选择权始终在你手中。*`
}
