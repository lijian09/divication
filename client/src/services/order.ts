import { callFunction } from './cloud'

/**
 * 支付相关 API
 * 通过云函数实现
 */

/** 套餐信息 */
interface PackageInfo {
  id: string
  name: string
  price: number
  singleCount: number
  threeCount: number
}

/** 创建订单参数 */
interface CreateOrderParams {
  packageId: string
}

/** 创建订单响应 */
interface CreateOrderResult {
  orderId: string
  payment: {
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
export async function getPackageList(): Promise<PackageInfo[]> {
  return callFunction<PackageInfo[]>('order', {
    action: 'getPackages',
  })
}

/**
 * 创建订单（微信支付统一下单）
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  return callFunction<CreateOrderResult>('order', {
    action: 'createOrder',
    packageId: params.packageId,
  })
}
