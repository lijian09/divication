/**
 * 环境变量读取工具
 * 统一读取 process.env 中的配置
 */

/**
 * API 基础地址
 */
export const API_BASE_URL = process.env.TARO_APP_API_BASE_URL || 'https://api.lingyu.com'

/**
 * 当前环境
 */
export const APP_ENV = process.env.TARO_APP_ENV || 'development'

/**
 * 是否为开发环境
 */
export const isDev = APP_ENV === 'development'

/**
 * 是否为生产环境
 */
export const isProd = APP_ENV === 'production'

/**
 * 微信小程序 AppID
 */
export const WX_APPID = process.env.TARO_APP_WX_APPID || ''
