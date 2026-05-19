import http from './http'

/**
 * 牌义相关 API
 */

/** 格式化牌义信息（按正逆位） */
interface FormattedCardDetail {
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
export async function getCardDetail(cardId: string, isReversed: boolean): Promise<FormattedCardDetail> {
  const result = await http.get<FormattedCardDetail>(
    `/api/card/${cardId}/detail`,
    { reversed: String(isReversed) },
  )
  return result.data
}
