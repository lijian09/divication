/**
 * 配额管理云函数
 *
 * 接口: getQuota
 *   获取用户当前配额
 *
 * 接口: deductQuota
 *   扣减配额（免费优先 → 付费）
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, spreadType } = event

  try {
    switch (action) {
      case 'getQuota':
        return await getQuota(OPENID)
      case 'deductQuota':
        return await deductQuota(OPENID, spreadType)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('[quota] 错误:', err)
    return { code: -1, message: err.message }
  }
}

/**
 * 获取用户配额
 */
async function getQuota(openid) {
  let quota = await db.collection('quotas')
    .where({ _openid: openid })
    .limit(1)
    .get()

  if (quota.data.length === 0) {
    // 自动初始化
    const today = new Date().toISOString().split('T')[0]
    await db.collection('quotas').add({
      data: {
        _openid: openid,
        free_single_remaining: 1,
        free_three_remaining: 0,
        paid_single_remaining: 0,
        paid_three_remaining: 0,
        free_reset_date: today,
        created_at: db.serverDate(),
      },
    })
    quota = await db.collection('quotas')
      .where({ _openid: openid })
      .limit(1)
      .get()
  }

  const q = quota.data[0]
  return {
    code: 0,
    data: {
      free_single_remaining: q.free_single_remaining || 0,
      free_three_remaining: q.free_three_remaining || 0,
      paid_single_remaining: q.paid_single_remaining || 0,
      paid_three_remaining: q.paid_three_remaining || 0,
      free_reset_date: q.free_reset_date,
    },
  }
}

/**
 * 扣减配额
 * 优先消耗免费次数 → 消耗付费次数
 */
async function deductQuota(openid, spreadType) {
  const isSingle = spreadType === 'single'
  const freeField = isSingle ? 'free_single_remaining' : 'free_three_remaining'
  const paidField = isSingle ? 'paid_single_remaining' : 'paid_three_remaining'

  // 先查当前配额
  const quotaRes = await db.collection('quotas')
    .where({ _openid: openid })
    .limit(1)
    .get()

  if (quotaRes.data.length === 0) {
    return { code: -1, message: '配额不存在' }
  }

  const quota = quotaRes.data[0]

  // 优先扣免费
  if ((quota[freeField] || 0) > 0) {
    await db.collection('quotas')
      .where({ _openid: openid })
      .update({ data: { [freeField]: _.inc(-1) } })
    return { code: 0, data: { type: 'free' } }
  }

  // 扣付费
  if ((quota[paidField] || 0) > 0) {
    await db.collection('quotas')
      .where({ _openid: openid })
      .update({
        data: {
          [paidField]: _.inc(-1),
          [isSingle ? 'total_paid_single_used' : 'total_paid_three_used']: _.inc(1),
        },
      })
    return { code: 0, data: { type: 'paid' } }
  }

  // 配额不足
  return { code: -1, message: '配额不足，请购买更多占卜次数' }
}
