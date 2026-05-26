/**
 * 占卜抽牌云函数
 *
 * 接口: draw
 *   抽牌（Fisher-Yates 洗牌 + 随机正逆位）
 *   自动调用 quota.deductQuota 扣减配额
 *
 * 接口: getHistory
 *   获取历史记录列表（分页）
 *
 * 接口: getDetail
 *   获取单条占卜记录详情
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, spreadType, questionCategory, questionText, page, pageSize, recordId } = event

  try {
    switch (action) {
      case 'draw':
        return await draw(OPENID, spreadType, questionCategory, questionText)
      case 'getHistory':
        return await getHistory(OPENID, page || 1, pageSize || 20)
      case 'getDetail':
        return await getDetail(OPENID, recordId)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('[divination] 错误:', err)
    return { code: -1, message: err.message }
  }
}

/**
 * 抽牌
 * 1. 扣减配额
 * 2. Fisher-Yates 洗牌
 * 3. 随机正逆位
 * 4. 保存记录
 */
async function draw(openid, spreadType, questionCategory, questionText) {
  // 1. 扣减配额（调用 quota 云函数）
  const quotaResult = await cloud.callFunction({
    name: 'quota',
    data: { action: 'deductQuota', spreadType },
  })

  if (quotaResult.result.code !== 0) {
    return { code: -1, message: quotaResult.result.message || '配额不足' }
  }

  // 2. 获取全部 78 张牌
  const cardsRes = await db.collection('cards')
    .orderBy('sort_order', 'asc')
    .get()

  const allCards = cardsRes.data
  if (allCards.length === 0) {
    return { code: -1, message: '牌库为空' }
  }

  // 3. Fisher-Yates 洗牌
  const shuffled = fisherYatesShuffle([...allCards])

  // 4. 抽指定数量
  const cardCount = spreadType === 'single' ? 1 : 3
  const positionNames = spreadType === 'single' ? [''] : ['过去', '现在', '未来']

  const drawnCards = shuffled.slice(0, cardCount).map((card, index) => {
    const isReversed = Math.random() < 0.5
    return {
      card_id: card.card_id,
      position: index + 1,
      position_name: positionNames[index],
      is_reversed: isReversed,
      name_cn: card.name_cn,
      name_en: card.name_en,
      upright_keywords: card.upright_keywords,
      reversed_keywords: card.reversed_keywords,
      image_url: card.image_url,
    }
  })

  // 5. 保存占卜记录
  const now = db.serverDate()
  const recordResult = await db.collection('records').add({
    data: {
      _openid: openid,
      question_category: questionCategory,
      question_text: questionText,
      spread_type: spreadType,
      cards: drawnCards.map(c => ({
        card_id: c.card_id,
        position: c.position,
        position_name: c.position_name,
        is_reversed: c.is_reversed,
      })),
      status: 'pending', // 等待 AI 解读
      created_at: now,
    },
  })

  return {
    code: 0,
    data: {
      recordId: recordResult._id,
      spread_type: spreadType,
      cards: drawnCards.map(c => ({
        id: c.card_id,
        name: c.name_cn,
        nameEn: c.name_en,
        position: c.position,
        positionName: c.position_name,
        isReversed: c.is_reversed,
        keywords: c.is_reversed ? c.reversed_keywords : c.upright_keywords,
        imageUrl: c.image_url,
      })),
      quotaType: quotaResult.result.data?.type || 'free',
    },
  }
}

/**
 * 获取历史记录列表（分页）
 */
async function getHistory(openid, page, pageSize) {
  const skip = (page - 1) * pageSize

  const totalRes = await db.collection('records')
    .where({ _openid: openid })
    .count()

  const recordsRes = await db.collection('records')
    .where({ _openid: openid })
    .orderBy('created_at', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  return {
    code: 0,
    data: {
      items: recordsRes.data.map(r => ({
        id: r._id,
        question_category: r.question_category,
        question_text: r.question_text,
        spread_type: r.spread_type,
        cardCount: r.cards?.length || 0,
        status: r.status,
        created_at: r.created_at,
      })),
      total: totalRes.total,
      page,
      pageSize,
      totalPages: Math.ceil(totalRes.total / pageSize),
    },
  }
}

/**
 * 获取占卜详情
 */
async function getDetail(openid, recordId) {
  const res = await db.collection('records')
    .where({ _id: recordId, _openid: openid })
    .limit(1)
    .get()

  if (res.data.length === 0) {
    return { code: -1, message: '记录不存在' }
  }

  const record = res.data[0]

  // 获取 AI 解读
  let interpretation = null
  const aiRes = await db.collection('interpretations')
    .where({ record_id: recordId })
    .limit(1)
    .get()

  if (aiRes.data.length > 0) {
    interpretation = {
      content: aiRes.data[0].filtered_content,
      model: aiRes.data[0].model,
      created_at: aiRes.data[0].created_at,
    }
  }

  return {
    code: 0,
    data: {
      id: record._id,
      question_category: record.question_category,
      question_text: record.question_text,
      spread_type: record.spread_type,
      cards: record.cards,
      status: record.status,
      interpretation,
      created_at: record.created_at,
    },
  }
}

/**
 * Fisher-Yates 洗牌算法
 */
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
