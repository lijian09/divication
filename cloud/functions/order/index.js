/**
 * 支付订单云函数
 *
 * 接口: getPackages
 *   获取套餐列表
 *
 * 接口: createOrder
 *   创建订单 + 微信支付统一下单
 *
 * 接口: payCallback
 *   支付回调处理
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 套餐定义
const PACKAGES = [
  { id: 'single_5', name: '单牌 5 次', price: 980, singleCount: 5, threeCount: 0 },
  { id: 'three_5', name: '三牌阵 5 次', price: 1980, singleCount: 0, threeCount: 5 },
  { id: 'mix_10', name: '混合 10 次', price: 2980, singleCount: 5, threeCount: 5 },
]

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, packageId } = event

  try {
    switch (action) {
      case 'getPackages':
        return { code: 0, data: PACKAGES }

      case 'createOrder':
        return await createOrder(OPENID, packageId)

      case 'payCallback':
        return await payCallback(event)

      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('[order] 错误:', err)
    return { code: -1, message: err.message }
  }
}

/**
 * 创建订单 + 微信支付统一下单
 */
async function createOrder(openid, packageId) {
  const pkg = PACKAGES.find(p => p.id === packageId)
  if (!pkg) {
    return { code: -1, message: '套餐不存在' }
  }

  // 创建订单记录
  const orderResult = await db.collection('orders').add({
    data: {
      _openid: openid,
      package_id: packageId,
      amount: pkg.price,
      status: 'pending',
      created_at: db.serverDate(),
    },
  })

  // 调用微信支付统一下单
  try {
    const result = await cloud.cloudPay.unifiedOrder({
      body: `灵谕 - ${pkg.name}`,
      outTradeNo: orderResult._id,
      spbillCreateIp: '127.0.0.1',
      subMchId: '', // 商户号，需在云开发控制台配置
      totalFee: pkg.price,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'order', // 支付回调云函数
    })

    return {
      code: 0,
      data: {
        orderId: orderResult._id,
        payment: result.payment, // 前端 wx.requestPayment 所需参数
      },
    }
  } catch (err) {
    console.error('[order] 微信支付统一下单失败:', err)
    return { code: -1, message: '支付创建失败' }
  }
}

/**
 * 支付回调处理
 * 微信支付成功后自动调用此云函数
 */
async function payCallback(event) {
  const { outTradeNo, resultCode } = event

  if (resultCode === 'SUCCESS') {
    // 查询订单
    const orderRes = await db.collection('orders')
      .where({ _id: outTradeNo })
      .limit(1)
      .get()

    if (orderRes.data.length > 0) {
      const order = orderRes.data[0]
      const pkg = PACKAGES.find(p => p.id === order.package_id)

      if (pkg) {
        // 发放配额
        await db.collection('quotas')
          .where({ _openid: order._openid })
          .update({
            data: {
              paid_single_remaining: _.inc(pkg.singleCount),
              paid_three_remaining: _.inc(pkg.threeCount),
            },
          })

        // 更新订单状态
        await db.collection('orders')
          .where({ _id: outTradeNo })
          .update({ data: { status: 'paid' } })
      }
    }
  }

  return { code: 0 }
}
