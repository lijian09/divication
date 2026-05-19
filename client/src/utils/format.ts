import dayjs from 'dayjs'

/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param date 日期字符串或时间戳
 * @param format 格式模板，默认 'YYYY-MM-DD'
 */
export function formatDate(date: string | number | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * 格式化为"MM/DD"格式（历史记录卡片用）
 */
export function formatDateShort(date: string | number | Date): string {
  return dayjs(date).format('MM/DD')
}

/**
 * 格式化为"YYYY年MM月DD日 HH:mm"格式
 */
export function formatDateTimeFull(date: string | number | Date): string {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm')
}

/**
 * 格式化为月份分组标题："YYYY年MM月"
 */
export function formatMonthTitle(date: string | number | Date): string {
  return dayjs(date).format('YYYY年MM月')
}

/**
 * 截断文字并加省略号
 * @param text 原始文字
 * @param maxLen 最大长度，默认 20
 */
export function truncateText(text: string, maxLen = 20): string {
  if (!text) return ''
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
}

/**
 * 格式化价格
 * @param amount 金额（分）
 */
export function formatPrice(amount: number): string {
  return `¥${(amount / 100).toFixed(1)}`
}
