/**
 * 牌义查询云函数
 *
 * 接口: GET /card
 *   查询所有牌（支持 arcana_type/suit 筛选）
 *
 * 接口: GET /card/:id
 *   查询单张牌详情
 *
 * 接口: GET /card/:id/detail?reversed=true
 *   按正逆位返回格式化牌义
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, cardId, arcanaType, suit, reversed } = event

  try {
    switch (action) {
      case 'list':
        return await listCards(arcanaType, suit)
      case 'detail':
        return await getCardDetail(cardId, reversed === 'true')
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('[card] 错误:', err)
    return { code: -1, message: err.message }
  }
}

/**
 * 查询牌列表
 */
async function listCards(arcanaType, suit) {
  const query = {}
  if (arcanaType) query.arcana_type = arcanaType
  if (suit) query.suit = suit

  const res = await db.collection('cards')
    .where(query)
    .orderBy('sort_order', 'asc')
    .get()

  return {
    code: 0,
    data: res.data.map(formatCard),
    total: res.data.length,
  }
}

/**
 * 查询单张牌详情（按正逆位格式化）
 */
async function getCardDetail(cardId, isReversed) {
  const res = await db.collection('cards')
    .where({ _id: cardId })
    .get()

  if (res.data.length === 0) {
    // 也支持按 card_id 查询
    const res2 = await db.collection('cards')
      .where({ card_id: cardId })
      .get()
    if (res2.data.length === 0) {
      return { code: -1, message: '牌不存在' }
    }
    return formatDetail(res2.data[0], isReversed)
  }

  return {
    code: 0,
    data: formatDetail(res.data[0], isReversed),
  }
}

function formatCard(card) {
  return {
    id: card.card_id,
    name: card.name_cn,
    nameEn: card.name_en,
    arcanaType: card.arcana_type,
    suit: card.suit,
    number: card.number,
    imageUrl: card.image_url,
    sortOrder: card.sort_order,
  }
}

function formatDetail(card, isReversed) {
  return {
    id: card.card_id,
    nameCn: card.name_cn,
    nameEn: card.name_en,
    arcanaType: card.arcana_type,
    suit: card.suit,
    number: card.number,
    imageUrl: card.image_url,
    isReversed,
    keywords: isReversed ? card.reversed_keywords : card.upright_keywords,
    meaning: isReversed ? card.reversed_meaning : card.upright_meaning,
  }
}
