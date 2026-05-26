/**
 * 微信登录云函数
 *
 * 接口: login
 *   静默登录，获取 openid，新用户自动初始化配额
 *
 * 接口: acceptAgreement
 *   确认免责协议
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID, APPID } = cloud.getWXContext()
  const { action, agreementVersion } = event

  try {
    switch (action) {
      case 'login':
        return await handleLogin(OPENID)
      case 'acceptAgreement':
        return await acceptAgreement(OPENID, agreementVersion)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('[login] 错误:', err)
    return { code: -1, message: err.message }
  }
}

/**
 * 登录处理
 * 查找或创建用户，返回用户信息
 */
async function handleLogin(openid) {
  // 查找已有用户
  const userRes = await db.collection('users')
    .where({ _openid: openid })
    .limit(1)
    .get()

  let user
  let isNewUser = false

  if (userRes.data.length === 0) {
    // 新用户 → 创建用户 + 初始化配额
    const now = db.serverDate()
    const today = new Date().toISOString().split('T')[0]

    user = {
      _openid: openid,
      nickname: '',
      avatar_url: '',
      agreement_accepted: false,
      agreement_version: null,
      created_at: now,
      updated_at: now,
    }

    const userResult = await db.collection('users').add({ data: user })
    user._id = userResult._id

    // 初始化配额
    await db.collection('quotas').add({
      data: {
        _openid: openid,
        free_single_remaining: 1,
        free_three_remaining: 0,
        paid_single_remaining: 0,
        paid_three_remaining: 0,
        free_reset_date: today,
        created_at: now,
      },
    })

    isNewUser = true
  } else {
    user = userRes.data[0]
  }

  return {
    code: 0,
    data: {
      token: openid, // 云函数用 openid 直接识别用户
      userInfo: {
        id: user._id,
        nickname: user.nickname || '',
        avatar_url: user.avatar_url || '',
        isNewUser,
        agreement_accepted: user.agreement_accepted || false,
      },
    },
  }
}

/**
 * 确认免责协议
 */
async function acceptAgreement(openid, agreementVersion) {
  await db.collection('users').where({ _openid: openid }).update({
    data: {
      agreement_accepted: true,
      agreement_version: agreementVersion || 'v1.0',
      updated_at: db.serverDate(),
    },
  })

  // 记录日志
  await db.collection('disclaimer_logs').add({
    data: {
      _openid: openid,
      agreement_version: agreementVersion || 'v1.0',
      created_at: db.serverDate(),
    },
  })

  return { code: 0, message: '已确认免责协议' }
}
