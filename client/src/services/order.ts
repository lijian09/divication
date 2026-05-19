import http from './http'

/**
 * 支付相关 API
 */

/** 创建订单参数 */
interface CreateOrderParams {
  packageId: string
}

/** 订单信息 */
interface OrderInfo {
  orderId: string
  packageId: string
  packageName: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  // 微信支付参数
  paymentParams?: {
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

/**
 * 获取套餐列表
 */
export async function getPackageList() {
  const result = await http.get('/api/order/packages')
  return result.data
}

/**
 * 创建订单
 */
export async function createOrder(params: CreateOrderParams) {
  const result = await http.post<OrderInfo>('/api/order/create', params)
  return result.data
}

/**
 * 查询订单状态
 */
export async function getOrderStatus(orderId: string) {
  const result = await http.get<OrderInfo>(`/api/order/${orderId}/status`)
  return result.data
}
