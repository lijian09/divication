/**
 * 灵谕塔罗牌 SVG 占位图生成器
 *
 * 生成 78 张塔罗牌的 SVG 占位图，符合品牌视觉规范
 * 运行方式: node scripts/generate-card-svgs.js
 */

const fs = require('fs')
const path = require('path')

// ============================================================
// 设计规范常量
// ============================================================

const DESIGN = {
  // 牌面尺寸
  width: 400,
  height: 640,

  // 品牌色彩
  colors: {
    deepPurple: '#1A0A2E',
    deepBlue: '#0D1B3E',
    gold: '#D4A843',
    lightGold: '#F0D68A',
    white: '#FFFFFF',
    textLight: '#E8D5B5',
  },

  // 四组色系（小阿尔卡纳）
  suitColors: {
    wands: '#D45A43',      // 暖红/橙色
    cups: '#4A7FD4',       // 蓝色/靛色
    swords: '#8A9BB0',     // 银灰/冷蓝
    pentacles: '#6B9E4A',  // 绿/金色
  },

  // 大阿尔卡纳专属色彩
  majorColors: {
    major_00: '#87CEEB',  // 愚人 - 天蓝色
    major_01: '#D45A43',  // 魔术师 - 红色
    major_02: '#9B7DB8',  // 女祭司 - 银紫色
    major_03: '#6B9E4A',  // 女皇 - 绿色
    major_04: '#D45A43',  // 皇帝 - 红色
    major_05: '#8A9BB0',  // 教皇 - 灰色
    major_06: '#E8A0BF',  // 恋人 - 粉色
    major_07: '#4A7FD4',  // 战车 - 蓝色
    major_08: '#D4A843',  // 力量 - 金色
    major_09: '#8A9BB0',  // 隐士 - 灰色
    major_10: '#4A7FD4',  // 命运之轮 - 蓝色
    major_11: '#6B9E4A',  // 正义 - 绿色
    major_12: '#4A7FD4',  // 倒吊人 - 蓝色
    major_13: '#2C2C2C',  // 死神 - 黑色
    major_14: '#4A7FD4',  // 节制 - 蓝色
    major_15: '#D45A43',  // 恶魔 - 红色
    major_16: '#D45A43',  // 塔 - 红色
    major_17: '#4A7FD4',  // 星星 - 蓝色
    major_18: '#C0C0C0',  // 月亮 - 银色
    major_19: '#D4A843',  // 太阳 - 金色
    major_20: '#D4A843',  // 审判 - 金色
    major_21: '#D4A843',  // 世界 - 金色
  },
}

// ============================================================
// 牌面数据定义
// ============================================================

// 大阿尔卡纳数据
const MAJOR_ARCANA = [
  { id: 'major_00', number: '00', nameCn: '愚人', nameEn: 'The Fool' },
  { id: 'major_01', number: '01', nameCn: '魔术师', nameEn: 'The Magician' },
  { id: 'major_02', number: '02', nameCn: '女祭司', nameEn: 'The High Priestess' },
  { id: 'major_03', number: '03', nameCn: '女皇', nameEn: 'The Empress' },
  { id: 'major_04', number: '04', nameCn: '皇帝', nameEn: 'The Emperor' },
  { id: 'major_05', number: '05', nameCn: '教皇', nameEn: 'The Hierophant' },
  { id: 'major_06', number: '06', nameCn: '恋人', nameEn: 'The Lovers' },
  { id: 'major_07', number: '07', nameCn: '战车', nameEn: 'The Chariot' },
  { id: 'major_08', number: '08', nameCn: '力量', nameEn: 'Strength' },
  { id: 'major_09', number: '09', nameCn: '隐士', nameEn: 'The Hermit' },
  { id: 'major_10', number: '10', nameCn: '命运之轮', nameEn: 'Wheel of Fortune' },
  { id: 'major_11', number: '11', nameCn: '正义', nameEn: 'Justice' },
  { id: 'major_12', number: '12', nameCn: '倒吊人', nameEn: 'The Hanged Man' },
  { id: 'major_13', number: '13', nameCn: '死神', nameEn: 'Death' },
  { id: 'major_14', number: '14', nameCn: '节制', nameEn: 'Temperance' },
  { id: 'major_15', number: '15', nameCn: '恶魔', nameEn: 'The Devil' },
  { id: 'major_16', number: '16', nameCn: '塔', nameEn: 'The Tower' },
  { id: 'major_17', number: '17', nameCn: '星星', nameEn: 'The Star' },
  { id: 'major_18', number: '18', nameCn: '月亮', nameEn: 'The Moon' },
  { id: 'major_19', number: '19', nameCn: '太阳', nameEn: 'The Sun' },
  { id: 'major_20', number: '20', nameCn: '审判', nameEn: 'Judgement' },
  { id: 'major_21', number: '21', nameCn: '世界', nameEn: 'The World' },
]

// 小阿尔卡纳花色数据
const SUITS = [
  { id: 'wands', nameCn: '权杖', nameEn: 'Wands', color: DESIGN.suitColors.wands },
  { id: 'cups', nameCn: '圣杯', nameEn: 'Cups', color: DESIGN.suitColors.cups },
  { id: 'swords', nameCn: '宝剑', nameEn: 'Swords', color: DESIGN.suitColors.swords },
  { id: 'pentacles', nameCn: '星币', nameEn: 'Pentacles', color: DESIGN.suitColors.pentacles },
]

// 小阿尔卡纳数字牌名称
const NUMBER_NAMES = {
  1: 'Ace',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
}

// 宫廷牌数据
const COURT_CARDS = [
  { number: 11, nameCn: '侍从', nameEn: 'Page' },
  { number: 12, nameCn: '骑士', nameEn: 'Knight' },
  { number: 13, nameCn: '王后', nameEn: 'Queen' },
  { number: 14, nameCn: '国王', nameEn: 'King' },
]

// ============================================================
// SVG 符号生成函数
// ============================================================

/**
 * 生成大阿尔卡纳的中心符号 SVG
 */
function getMajorSymbol(cardId) {
  const symbolColor = DESIGN.majorColors[cardId] || DESIGN.colors.gold

  const symbols = {
    // 愚人 - 花朵/蝴蝶
    major_00: `
      <circle cx="200" cy="280" r="40" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <circle cx="200" cy="280" r="25" fill="none" stroke="${symbolColor}" stroke-width="1.5"/>
      <circle cx="200" cy="280" r="10" fill="${symbolColor}" opacity="0.6"/>
      <path d="M180 280 Q200 240 220 280" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <path d="M180 280 Q200 320 220 280" fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 魔术师 - 无限符号
    major_01: `
      <path d="M160 280 C160 250 200 250 200 280 C200 250 240 250 240 280 C240 310 200 310 200 280 C200 310 160 310 160 280Z"
            fill="none" stroke="${symbolColor}" stroke-width="3"/>
      <circle cx="200" cy="280" r="8" fill="${symbolColor}"/>
    `,
    // 女祭司 - 月亮/柱子
    major_02: `
      <path d="M185 250 A15 15 0 0 1 185 310 A25 25 0 0 0 185 250" fill="${symbolColor}" opacity="0.7"/>
      <rect x="195" y="240" width="10" height="80" fill="${symbolColor}" opacity="0.4"/>
      <circle cx="200" cy="320" r="15" fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 女皇 - 星星/皇冠
    major_03: `
      <polygon points="200,240 210,260 230,260 215,275 220,295 200,285 180,295 185,275 170,260 190,260"
               fill="${symbolColor}" opacity="0.8"/>
      <circle cx="200" cy="320" r="20" fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 皇帝 - 权杖/王座
    major_04: `
      <rect x="190" y="240" width="20" height="80" fill="${symbolColor}" opacity="0.7"/>
      <polygon points="200,230 185,250 215,250" fill="${symbolColor}"/>
      <rect x="175" y="300" width="50" height="10" fill="${symbolColor}" opacity="0.5"/>
    `,
    // 教皇 - 钥匙/十字架
    major_05: `
      <line x1="200" y1="240" x2="200" y2="320" stroke="${symbolColor}" stroke-width="3"/>
      <line x1="175" y1="265" x2="225" y2="265" stroke="${symbolColor}" stroke-width="3"/>
      <circle cx="200" cy="240" r="10" fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 恋人 - 心形
    major_06: `
      <path d="M200 310 C200 310 160 280 160 260 C160 240 180 230 200 250 C220 230 240 240 240 260 C240 280 200 310 200 310Z"
            fill="${symbolColor}" opacity="0.7"/>
      <path d="M200 310 C200 310 160 280 160 260 C160 240 180 230 200 250 C220 230 240 240 240 260 C240 280 200 310 200 310Z"
            fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 战车 - 星星/盾牌
    major_07: `
      <polygon points="200,240 215,265 240,270 220,290 225,315 200,300 175,315 180,290 160,270 185,265"
               fill="${symbolColor}" opacity="0.7"/>
      <polygon points="200,240 215,265 240,270 220,290 225,315 200,300 175,315 180,290 160,270 185,265"
               fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 力量 - 无限符号+狮子
    major_08: `
      <path d="M170 270 C170 250 200 250 200 270 C200 250 230 250 230 270 C230 290 200 290 200 270 C200 290 170 290 170 270Z"
            fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="200" cy="320" r="20" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <circle cx="200" cy="320" r="8" fill="${symbolColor}" opacity="0.5"/>
    `,
    // 隐士 - 灯笼
    major_09: `
      <polygon points="200,240 185,270 215,270" fill="${symbolColor}" opacity="0.6"/>
      <rect x="190" y="270" width="20" height="40" fill="${symbolColor}" opacity="0.5"/>
      <circle cx="200" cy="320" r="15" fill="${symbolColor}" opacity="0.4"/>
      <line x1="200" y1="230" x2="200" y2="240" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 命运之轮 - 轮子
    major_10: `
      <circle cx="200" cy="280" r="40" fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="200" cy="280" r="30" fill="none" stroke="${symbolColor}" stroke-width="1.5"/>
      <circle cx="200" cy="280" r="15" fill="${symbolColor}" opacity="0.4"/>
      <line x1="200" y1="240" x2="200" y2="320" stroke="${symbolColor}" stroke-width="1.5"/>
      <line x1="160" y1="280" x2="240" y2="280" stroke="${symbolColor}" stroke-width="1.5"/>
    `,
    // 正义 - 天平
    major_11: `
      <line x1="200" y1="240" x2="200" y2="300" stroke="${symbolColor}" stroke-width="2.5"/>
      <line x1="165" y1="265" x2="235" y2="265" stroke="${symbolColor}" stroke-width="2.5"/>
      <path d="M165 265 L155 285 L175 285 Z" fill="${symbolColor}" opacity="0.6"/>
      <path d="M235 265 L225 285 L245 285 Z" fill="${symbolColor}" opacity="0.6"/>
      <line x1="185" y1="300" x2="215" y2="300" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 倒吊人 - 倒三角
    major_12: `
      <polygon points="200,320 165,250 235,250" fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="200" cy="280" r="10" fill="${symbolColor}" opacity="0.5"/>
      <line x1="200" y1="230" x2="200" y2="250" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 死神 - 骷髅/玫瑰
    major_13: `
      <circle cx="200" cy="270" r="25" fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="190" cy="262" r="5" fill="${symbolColor}" opacity="0.6"/>
      <circle cx="210" cy="262" r="5" fill="${symbolColor}" opacity="0.6"/>
      <path d="M192 280 L200 288 L208 280" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="200" y1="295" x2="200" y2="330" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 节制 - 天使翅膀
    major_14: `
      <path d="M200 260 Q160 240 150 280 Q160 300 200 290" fill="${symbolColor}" opacity="0.5"/>
      <path d="M200 260 Q240 240 250 280 Q240 300 200 290" fill="${symbolColor}" opacity="0.5"/>
      <circle cx="200" cy="260" r="12" fill="${symbolColor}" opacity="0.6"/>
      <line x1="200" y1="290" x2="200" y2="330" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 恶魔 - 倒五角星
    major_15: `
      <polygon points="200,240 212,270 245,270 218,290 228,320 200,300 172,320 182,290 155,270 188,270"
               fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="200" cy="280" r="15" fill="${symbolColor}" opacity="0.4"/>
    `,
    // 塔 - 闪电/塔
    major_16: `
      <polygon points="185,320 195,240 205,240 215,320" fill="${symbolColor}" opacity="0.6"/>
      <polygon points="180,320 220,320 215,330 185,330" fill="${symbolColor}" opacity="0.7"/>
      <line x1="190" y1="230" x2="200" y2="250" stroke="${symbolColor}" stroke-width="3"/>
      <line x1="210" y1="230" x2="200" y2="250" stroke="${symbolColor}" stroke-width="3"/>
    `,
    // 星星 - 八芒星
    major_17: `
      <polygon points="200,240 208,265 235,265 215,280 222,305 200,290 178,305 185,280 165,265 192,265"
               fill="${symbolColor}" opacity="0.7"/>
      <polygon points="200,240 208,265 235,265 215,280 222,305 200,290 178,305 185,280 165,265 192,265"
               fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <circle cx="200" cy="270" r="8" fill="${symbolColor}" opacity="0.5"/>
    `,
    // 月亮 - 新月
    major_18: `
      <path d="M200 240 A40 40 0 0 1 200 320 A30 30 0 0 0 200 240" fill="${symbolColor}" opacity="0.7"/>
      <circle cx="185" cy="265" r="3" fill="${DESIGN.colors.deepPurple}"/>
      <circle cx="195" cy="300" r="2" fill="${DESIGN.colors.deepPurple}"/>
    `,
    // 太阳 - 太阳光芒
    major_19: `
      <circle cx="200" cy="275" r="25" fill="${symbolColor}" opacity="0.7"/>
      <circle cx="200" cy="275" r="35" fill="none" stroke="${symbolColor}" stroke-width="1.5"/>
      <line x1="200" y1="230" x2="200" y2="240" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="200" y1="310" x2="200" y2="320" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="155" y1="275" x2="165" y2="275" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="235" y1="275" x2="245" y2="275" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="170" y1="245" x2="177" y2="252" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="223" y1="298" x2="230" y2="305" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="230" y1="245" x2="223" y2="252" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="177" y1="298" x2="170" y2="305" stroke="${symbolColor}" stroke-width="2"/>
    `,
    // 审判 - 喇叭/号角
    major_20: `
      <path d="M185 280 L200 250 L215 280" fill="${symbolColor}" opacity="0.6"/>
      <rect x="195" y="250" width="10" height="40" fill="${symbolColor}" opacity="0.5"/>
      <circle cx="200" cy="310" r="15" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <line x1="185" y1="310" x2="215" y2="310" stroke="${symbolColor}" stroke-width="1.5"/>
    `,
    // 世界 - 花环/圆圈
    major_21: `
      <circle cx="200" cy="280" r="40" fill="none" stroke="${symbolColor}" stroke-width="2.5"/>
      <circle cx="200" cy="280" r="30" fill="none" stroke="${symbolColor}" stroke-width="1.5"/>
      <path d="M170 280 Q185 260 200 280 Q215 260 230 280" fill="none" stroke="${symbolColor}" stroke-width="2"/>
      <path d="M170 280 Q185 300 200 280 Q215 300 230 280" fill="none" stroke="${symbolColor}" stroke-width="2"/>
    `,
  }

  return symbols[cardId] || `
    <circle cx="200" cy="280" r="30" fill="none" stroke="${DESIGN.colors.gold}" stroke-width="2"/>
    <circle cx="200" cy="280" r="15" fill="${DESIGN.colors.gold}" opacity="0.5"/>
  `
}

/**
 * 生成小阿尔卡纳的花色符号 SVG
 */
function getSuitSymbol(suitId, count) {
  const color = DESIGN.suitColors[suitId]

  // 花色基础符号
  const baseSymbols = {
    // 权杖 - 火焰/棍棒
    wands: (x, y, scale = 1) => `
      <rect x="${x - 3 * scale}" y="${y - 20 * scale}" width="${6 * scale}" height="${40 * scale}" fill="${color}" opacity="0.7"/>
      <polygon points="${x},${y - 25 * scale} ${x - 8 * scale},${y - 15 * scale} ${x + 8 * scale},${y - 15 * scale}" fill="${color}" opacity="0.8"/>
    `,
    // 圣杯 - 杯子
    cups: (x, y, scale = 1) => `
      <path d="M${x - 12 * scale} ${y - 15 * scale} Q${x - 15 * scale} ${y + 10 * scale} ${x} ${y + 15 * scale} Q${x + 15 * scale} ${y + 10 * scale} ${x + 12 * scale} ${y - 15 * scale} Z"
            fill="${color}" opacity="0.6"/>
      <ellipse cx="${x}" cy="${y - 15 * scale}" rx="${12 * scale}" ry="${4 * scale}" fill="${color}" opacity="0.8"/>
    `,
    // 宝剑 - 剑
    swords: (x, y, scale = 1) => `
      <line x1="${x}" y1="${y - 25 * scale}" x2="${x}" y2="${y + 20 * scale}" stroke="${color}" stroke-width="${3 * scale}"/>
      <polygon points="${x},${y - 25 * scale} ${x - 5 * scale},${y - 15 * scale} ${x + 5 * scale},${y - 15 * scale}" fill="${color}" opacity="0.8"/>
      <line x1="${x - 10 * scale}" y1="${y + 5 * scale}" x2="${x + 10 * scale}" y2="${y + 5 * scale}" stroke="${color}" stroke-width="${2 * scale}"/>
    `,
    // 星币 - 五角星/硬币
    pentacles: (x, y, scale = 1) => `
      <circle cx="${x}" cy="${y}" r="${15 * scale}" fill="none" stroke="${color}" stroke-width="${2 * scale}"/>
      <polygon points="${x},${y - 12 * scale} ${x + 5 * scale},${y - 4 * scale} ${x + 12 * scale},${y - 4 * scale} ${x + 7 * scale},${y + 3 * scale} ${x + 9 * scale},${y + 12 * scale} ${x},${y + 7 * scale} ${x - 9 * scale},${y + 12 * scale} ${x - 7 * scale},${y + 3 * scale} ${x - 12 * scale},${y - 4 * scale} ${x - 5 * scale},${y - 4 * scale}"
               fill="${color}" opacity="0.5"/>
    `,
  }

  const symbolFn = baseSymbols[suitId]
  if (!symbolFn) return ''

  // 根据数量排列符号
  const positions = getSymbolPositions(count)
  let svg = ''

  positions.forEach(({ x, y, scale }) => {
    svg += symbolFn(x, y, scale || 1)
  })

  return svg
}

/**
 * 根据数量计算符号排列位置
 */
function getSymbolPositions(count) {
  const cx = 200
  const cy = 280

  switch (count) {
    case 1:
      return [{ x: cx, y: cy, scale: 1.5 }]
    case 2:
      return [
        { x: cx, y: cy - 40, scale: 1 },
        { x: cx, y: cy + 40, scale: 1 },
      ]
    case 3:
      return [
        { x: cx, y: cy - 50, scale: 1 },
        { x: cx - 35, y: cy + 20, scale: 1 },
        { x: cx + 35, y: cy + 20, scale: 1 },
      ]
    case 4:
      return [
        { x: cx - 30, y: cy - 30, scale: 0.9 },
        { x: cx + 30, y: cy - 30, scale: 0.9 },
        { x: cx - 30, y: cy + 30, scale: 0.9 },
        { x: cx + 30, y: cy + 30, scale: 0.9 },
      ]
    case 5:
      return [
        { x: cx, y: cy, scale: 1 },
        { x: cx - 35, y: cy - 40, scale: 0.8 },
        { x: cx + 35, y: cy - 40, scale: 0.8 },
        { x: cx - 35, y: cy + 40, scale: 0.8 },
        { x: cx + 35, y: cy + 40, scale: 0.8 },
      ]
    case 6:
      return [
        { x: cx - 30, y: cy - 45, scale: 0.8 },
        { x: cx + 30, y: cy - 45, scale: 0.8 },
        { x: cx - 30, y: cy, scale: 0.8 },
        { x: cx + 30, y: cy, scale: 0.8 },
        { x: cx - 30, y: cy + 45, scale: 0.8 },
        { x: cx + 30, y: cy + 45, scale: 0.8 },
      ]
    case 7:
      return [
        { x: cx, y: cy - 50, scale: 0.8 },
        { x: cx - 30, y: cy - 20, scale: 0.8 },
        { x: cx + 30, y: cy - 20, scale: 0.8 },
        { x: cx, y: cy, scale: 0.9 },
        { x: cx - 30, y: cy + 20, scale: 0.8 },
        { x: cx + 30, y: cy + 20, scale: 0.8 },
        { x: cx, y: cy + 50, scale: 0.8 },
      ]
    case 8:
      return [
        { x: cx - 30, y: cy - 55, scale: 0.75 },
        { x: cx + 30, y: cy - 55, scale: 0.75 },
        { x: cx - 30, y: cy - 20, scale: 0.75 },
        { x: cx + 30, y: cy - 20, scale: 0.75 },
        { x: cx - 30, y: cy + 15, scale: 0.75 },
        { x: cx + 30, y: cy + 15, scale: 0.75 },
        { x: cx - 30, y: cy + 50, scale: 0.75 },
        { x: cx + 30, y: cy + 50, scale: 0.75 },
      ]
    case 9:
      return [
        { x: cx - 30, y: cy - 55, scale: 0.7 },
        { x: cx, y: cy - 55, scale: 0.7 },
        { x: cx + 30, y: cy - 55, scale: 0.7 },
        { x: cx - 30, y: cy, scale: 0.7 },
        { x: cx, y: cy, scale: 0.8 },
        { x: cx + 30, y: cy, scale: 0.7 },
        { x: cx - 30, y: cy + 55, scale: 0.7 },
        { x: cx, y: cy + 55, scale: 0.7 },
        { x: cx + 30, y: cy + 55, scale: 0.7 },
      ]
    case 10:
      return [
        { x: cx - 30, y: cy - 60, scale: 0.7 },
        { x: cx, y: cy - 60, scale: 0.7 },
        { x: cx + 30, y: cy - 60, scale: 0.7 },
        { x: cx - 35, y: cy - 20, scale: 0.7 },
        { x: cx, y: cy - 20, scale: 0.7 },
        { x: cx + 35, y: cy - 20, scale: 0.7 },
        { x: cx - 30, y: cy + 20, scale: 0.7 },
        { x: cx, y: cy + 20, scale: 0.7 },
        { x: cx + 30, y: cy + 20, scale: 0.7 },
        { x: cx, y: cy + 60, scale: 0.7 },
      ]
    default:
      return [{ x: cx, y: cy, scale: 1 }]
  }
}

/**
 * 生成宫廷牌的符号
 */
function getCourtSymbol(suitId, courtType) {
  const color = DESIGN.suitColors[suitId]

  const courtSymbols = {
    // 侍从 - 小盾牌
    Page: `
      <rect x="185" y="255" width="30" height="40" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="200" y1="255" x2="200" y2="295" stroke="${color}" stroke-width="1.5"/>
      <line x1="185" y1="275" x2="215" y2="275" stroke="${color}" stroke-width="1.5"/>
    `,
    // 骑士 - 马/骑士头盔
    Knight: `
      <path d="M190 260 Q200 245 210 260 L210 290 L190 290 Z" fill="${color}" opacity="0.6"/>
      <circle cx="200" cy="255" r="12" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="200" y1="267" x2="200" y2="290" stroke="${color}" stroke-width="2"/>
    `,
    // 王后 - 皇冠
    Queen: `
      <polygon points="185,280 190,260 195,270 200,250 205,270 210,260 215,280" fill="${color}" opacity="0.7"/>
      <rect x="185" y="280" width="30" height="15" fill="${color}" opacity="0.5"/>
      <circle cx="192" cy="295" r="5" fill="${color}" opacity="0.6"/>
      <circle cx="200" cy="295" r="5" fill="${color}" opacity="0.6"/>
      <circle cx="208" cy="295" r="5" fill="${color}" opacity="0.6"/>
    `,
    // 国王 - 王冠+权杖
    King: `
      <polygon points="185,280 188,265 193,275 200,255 207,275 212,265 215,280" fill="${color}" opacity="0.7"/>
      <rect x="185" y="280" width="30" height="10" fill="${color}" opacity="0.6"/>
      <line x1="220" y1="260" x2="220" y2="300" stroke="${color}" stroke-width="2.5"/>
      <polygon points="220,255 215,262 225,262" fill="${color}"/>
    `,
  }

  return courtSymbols[courtType] || courtSymbols.Page
}

// ============================================================
// SVG 模板生成
// ============================================================

/**
 * 生成完整的牌面 SVG
 */
function generateCardSVG(card) {
  const { id, nameCn, nameEn, number, arcanaType, suit, symbol } = card
  const { width, height, colors } = DESIGN

  // 确定主色调
  const accentColor = arcanaType === 'major'
    ? DESIGN.majorColors[id]
    : DESIGN.suitColors[suit]

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- 背景渐变 -->
    <linearGradient id="bg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.deepPurple};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.deepBlue};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.deepPurple};stop-opacity:1" />
    </linearGradient>

    <!-- 金色边框渐变 -->
    <linearGradient id="border_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.lightGold};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.gold};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.lightGold};stop-opacity:1" />
    </linearGradient>

    <!-- 装饰图案 -->
    <pattern id="dots_${id}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="0.5" fill="${colors.gold}" opacity="0.15"/>
    </pattern>
  </defs>

  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="url(#bg_${id})"/>
  <rect width="${width}" height="${height}" fill="url(#dots_${id})"/>

  <!-- 金色边框 -->
  <rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="8" ry="8"
        fill="none" stroke="url(#border_${id})" stroke-width="2"/>
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="5" ry="5"
        fill="none" stroke="${colors.gold}" stroke-width="0.5" opacity="0.5"/>

  <!-- 顶部装饰线 -->
  <line x1="50" y1="60" x2="${width - 50}" y2="60" stroke="${colors.gold}" stroke-width="0.5" opacity="0.5"/>

  <!-- 顶部编号 -->
  <text x="${width / 2}" y="45" text-anchor="middle" font-family="Georgia, serif"
        font-size="24" fill="${colors.lightGold}" font-weight="bold" letter-spacing="3">
    ${number}
  </text>

  <!-- 中央符号区域 -->
  <g transform="translate(0, 20)">
    ${symbol}
  </g>

  <!-- 底部装饰线 -->
  <line x1="50" y1="${height - 90}" x2="${width - 50}" y2="${height - 90}" stroke="${colors.gold}" stroke-width="0.5" opacity="0.5"/>

  <!-- 底部中文牌名 -->
  <text x="${width / 2}" y="${height - 55}" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="18" fill="${colors.lightGold}" font-weight="500" letter-spacing="4">
    ${nameCn}
  </text>

  <!-- 底部英文牌名 -->
  <text x="${width / 2}" y="${height - 30}" text-anchor="middle" font-family="Georgia, serif"
        font-size="10" fill="${colors.gold}" opacity="0.7" letter-spacing="1">
    ${nameEn}
  </text>

  <!-- 角落装饰 -->
  <circle cx="25" cy="25" r="3" fill="${colors.gold}" opacity="0.5"/>
  <circle cx="${width - 25}" cy="25" r="3" fill="${colors.gold}" opacity="0.5"/>
  <circle cx="25" cy="${height - 25}" r="3" fill="${colors.gold}" opacity="0.5"/>
  <circle cx="${width - 25}" cy="${height - 25}" r="3" fill="${colors.gold}" opacity="0.5"/>
</svg>`
}

// ============================================================
// 卡片数据生成
// ============================================================

/**
 * 生成所有 78 张牌的数据
 */
function generateAllCards() {
  const cards = []

  // 生成大阿尔卡纳
  MAJOR_ARCANA.forEach((card) => {
    cards.push({
      ...card,
      arcanaType: 'major',
      suit: null,
      symbol: getMajorSymbol(card.id),
    })
  })

  // 生成小阿尔卡纳
  SUITS.forEach((suit) => {
    // 数字牌 (1-10)
    for (let i = 1; i <= 10; i++) {
      cards.push({
        id: `${suit.id}_${String(i).padStart(2, '0')}`,
        number: i === 1 ? 'A' : String(i),
        nameCn: i === 1 ? `Ace of ${suit.nameCn}` : `${NUMBER_NAMES[i]} of ${suit.nameCn}`,
        nameEn: `${NUMBER_NAMES[i]} of ${suit.nameEn}`,
        arcanaType: 'minor',
        suit: suit.id,
        symbol: getSuitSymbol(suit.id, i),
      })
    }

    // 宫廷牌
    COURT_CARDS.forEach((court) => {
      cards.push({
        id: `${suit.id}_${String(court.number).padStart(2, '0')}`,
        number: court.nameEn.charAt(0),
        nameCn: `${suit.nameCn}${court.nameCn}`,
        nameEn: `${court.nameEn} of ${suit.nameEn}`,
        arcanaType: 'minor',
        suit: suit.id,
        symbol: getCourtSymbol(suit.id, court.nameEn),
      })
    })
  })

  return cards
}

// ============================================================
// 文件操作
// ============================================================

/**
 * 更新 cards.json 中的 image_url 字段
 */
function updateCardsJson(cards) {
  const cardsJsonPath = path.join(__dirname, '..', 'cloud', 'database', 'cards.json')

  try {
    const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'))

    // 创建 card_id 到新 image_url 的映射
    const imageUrlMap = {}
    cards.forEach((card) => {
      imageUrlMap[card.id] = `/images/cards/${card.id}.svg`
    })

    // 更新所有 image_url
    const updatedCards = cardsData.map((card) => ({
      ...card,
      image_url: imageUrlMap[card.card_id] || card.image_url,
    }))

    fs.writeFileSync(cardsJsonPath, JSON.stringify(updatedCards, null, 2), 'utf8')
    console.log('✅ Updated cards.json image_url fields')
  } catch (error) {
    console.error('❌ Error updating cards.json:', error.message)
  }
}

/**
 * 生成所有 SVG 文件
 */
function generateSvgFiles(cards) {
  const outputDir = path.join(__dirname, '..', 'client', 'src', 'assets', 'images', 'cards')

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let successCount = 0
  let errorCount = 0

  cards.forEach((card) => {
    try {
      const svgContent = generateCardSVG(card)
      const filePath = path.join(outputDir, `${card.id}.svg`)

      fs.writeFileSync(filePath, svgContent, 'utf8')
      successCount++
    } catch (error) {
      console.error(`❌ Error generating ${card.id}.svg:`, error.message)
      errorCount++
    }
  })

  return { successCount, errorCount }
}

// ============================================================
// 主程序
// ============================================================

function main() {
  console.log('🎴 灵谕塔罗牌 SVG 占位图生成器')
  console.log('================================\n')

  // 生成所有卡片数据
  console.log('📋 Generating card data...')
  const cards = generateAllCards()
  console.log(`   Generated data for ${cards.length} cards\n`)

  // 生成 SVG 文件
  console.log('🎨 Generating SVG files...')
  const { successCount, errorCount } = generateSvgFiles(cards)
  console.log(`   ✅ Success: ${successCount}`)
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`)
  }
  console.log('')

  // 更新 cards.json
  console.log('📝 Updating cards.json...')
  updateCardsJson(cards)
  console.log('')

  // 输出统计信息
  console.log('📊 Statistics:')
  console.log(`   Major Arcana: ${MAJOR_ARCANA.length} cards`)
  console.log(`   Minor Arcana: ${SUITS.length * 14} cards`)
  console.log(`   Total: ${cards.length} cards\n`)

  console.log('✨ Done! SVG files generated to:')
  console.log('   client/src/assets/images/cards/')
}

// 运行主程序
main()
