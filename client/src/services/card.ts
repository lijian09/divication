import { callFunction } from './cloud'

/**
 * 牌义相关 API
 * 通过云函数实现
 */

/** 格式化牌义信息（按正逆位） */
interface CardDetail {
  id: string
  nameCn: string
  nameEn: string
  arcanaType: string
  suit: string | null
  number: number
  imageUrl: string
  isReversed: boolean
  keywords: string
  meaning: string
}

/**
 * 获取格式化牌义详情（按正逆位返回对应关键词和含义）
 */
export async function getCardDetail(cardId: string, isReversed: boolean): Promise<CardDetail> {
  return callFunction<CardDetail>('card', {
    action: 'detail',
    cardId,
    reversed: String(isReversed),
  })
}
