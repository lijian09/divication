/**
 * 性能检测工具 — F-510 低端机型动画降级
 * 检测设备性能等级，自动禁用昂贵动画
 */

import Taro from '@tarojs/taro'

/** 设备性能等级 */
export type PerfLevel = 'high' | 'medium' | 'low'

let cachedLevel: PerfLevel | null = null

/**
 * 检测设备性能等级
 * 基于以下指标综合判断：
 * 1. 系统内存（wx.getDeviceInfo）
 * 2. CPU 核心数
 * 3. 设备型号（已知低端机型列表）
 */
export function getDevicePerfLevel(): PerfLevel {
  if (cachedLevel) return cachedLevel

  try {
    const deviceInfo = Taro.getDeviceInfo()
    const systemInfo = Taro.getSystemInfoSync()

    const memoryGB = (deviceInfo as any).memorySize
      ? (deviceInfo as any).memorySize / 1024
      : 4 // 默认 4GB
    const cpuCores = systemInfo.hardwareConcurrency || 4
    const platform = systemInfo.platform
    const model = systemInfo.model || ''

    // 已知低端机型关键词
    const lowEndKeywords = [
      'iPhone 6', 'iPhone 7', 'iPhone 8', 'iPhone SE',
      'Redmi', 'Redmi Note', 'OPPO A', 'vivo Y',
      'HONOR Play', 'HUAWEI Y',
    ]

    const isLowEndModel = lowEndKeywords.some((kw) => model.includes(kw))

    if (isLowEndModel || memoryGB <= 3 || cpuCores <= 4) {
      cachedLevel = 'low'
    } else if (memoryGB <= 5 || cpuCores <= 6) {
      cachedLevel = 'medium'
    } else {
      cachedLevel = 'high'
    }
  } catch {
    // 检测失败默认中等
    cachedLevel = 'medium'
  }

  return cachedLevel
}

/**
 * 是否应禁用昂贵动画
 * 低端设备返回 true
 */
export function shouldDisableHeavyAnimations(): boolean {
  return getDevicePerfLevel() === 'low'
}

/**
 * 获取动画持续时间（低端设备缩短）
 * @param normalMs 正常设备的动画时长
 * @returns 适配后的时长
 */
export function getAnimDuration(normalMs: number): number {
  const level = getDevicePerfLevel()
  switch (level) {
    case 'low':
      return Math.min(normalMs * 0.5, 200) // 最长 200ms
    case 'medium':
      return normalMs * 0.8
    case 'high':
    default:
      return normalMs
  }
}

/**
 * 是否启用星空粒子背景
 * 低端设备关闭粒子以节省 GPU
 */
export function shouldEnableStarParticles(): boolean {
  return getDevicePerfLevel() !== 'low'
}

/**
 * 星空粒子数量（根据性能调整）
 */
export function getStarParticleCount(): number {
  const level = getDevicePerfLevel()
  switch (level) {
    case 'low':
      return 0
    case 'medium':
      return 12
    case 'high':
    default:
      return 25
  }
}
