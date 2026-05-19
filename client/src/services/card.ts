import http from './http'

/**
 * 牌义相关 API
 */

/** 牌义信息 */
interface CardInfo {
  id: string
  name: string
  nameEn: string
  type: 'major' | 'minor'
  number: number
  uprightKeywords: string[]
  reversedKeywords: string[]
  uprightMeaning: string
  reversedMeaning: string
  imageUrl: string
}

/**
 * 获取全部牌义列表
 */
export async function getAllCards() {
  const result = await http.get<CardInfo[]>('/api/cards')
  return result.data
}

/**
 * 获取单张牌义详情
 */
export async function getCardDetail(cardId: string) {
  const result = await http.get<CardInfo>(`/api/cards/${cardId}`)
  return result.data
}
