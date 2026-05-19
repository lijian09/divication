/**
 * 分享配置工具
 * 统一设置小程序分享参数
 */

interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

/**
 * 默认分享配置
 */
const DEFAULT_SHARE: ShareConfig = {
  title: '灵谕 - AI 塔罗牌解读',
  path: '/pages/home/index',
}

/**
 * 生成分享配置
 * @param config 自定义分享参数
 */
export function getShareConfig(config?: Partial<ShareConfig>): ShareConfig {
  return {
    ...DEFAULT_SHARE,
    ...config,
  }
}

/**
 * 占卜结果分享配置
 */
export function getResultShareConfig(
  question: string,
  cardName: string,
): ShareConfig {
  return {
    title: `${question} - ${cardName} | 灵谕塔罗`,
    path: '/pages/home/index',
  }
}
