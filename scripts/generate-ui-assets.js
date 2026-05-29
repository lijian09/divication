/**
 * 灵谕塔罗牌 UI 资源生成器
 *
 * 生成品牌资源、TabBar 图标、引导页插画、空状态和错误状态插画
 * 运行方式: node scripts/generate-ui-assets.js
 */

const fs = require('fs')
const path = require('path')

// ============================================================
// 品牌色彩规范
// ============================================================

const BRAND = {
  deepPurple: '#1A0A2E',
  deepBlue: '#0D1B3E',
  gold: '#D4A843',
  lightGold: '#F0D68A',
  white: '#FFFFFF',
  gray: '#A8A3B8',
  darkGray: '#6B6580',
  errorRed: '#E53935',
  successGreen: '#4CAF50',
}

// ============================================================
// 路径配置
// ============================================================

const BASE_DIR = path.join(__dirname, '..', 'client', 'src', 'assets', 'images')

const DIRS = {
  icons: path.join(BASE_DIR, 'icons'),
  brand: path.join(BASE_DIR, 'brand'),
  onboarding: path.join(BASE_DIR, 'onboarding'),
  empty: path.join(BASE_DIR, 'empty'),
  error: path.join(BASE_DIR, 'error'),
}

// ============================================================
// 工具函数
// ============================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function writeSvg(filePath, content) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n${content}`
  fs.writeFileSync(filePath, svg, 'utf8')
}

function writePng(filePath, svgContent, width, height) {
  // 尝试使用 sharp 生成 PNG
  try {
    const sharp = require('sharp')
    const buffer = Buffer.from(svgContent)
    sharp(buffer)
      .resize(width, height)
      .png()
      .toFile(filePath)
      .then(() => {
        console.log(`  PNG: ${path.basename(filePath)}`)
      })
      .catch((err) => {
        console.log(`  PNG generation failed for ${path.basename(filePath)}: ${err.message}`)
      })
    return true
  } catch (e) {
    // sharp 不可用
  }

  // 尝试使用 canvas 生成 PNG
  try {
    const { createCanvas, loadImage } = require('canvas')
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`
    ctx.drawImage(img, 0, 0, width, height)
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(filePath, buffer)
    console.log(`  PNG (canvas): ${path.basename(filePath)}`)
    return true
  } catch (e) {
    // canvas 不可用
  }

  return false
}

// ============================================================
// TabBar 图标 SVG 生成
// ============================================================

function generateTabBarIcons() {
  const icons = []

  // --- 首页图标 (房子) ---
  const homeDefault = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.darkGray}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- 屋顶 -->
    <path d="M40.5 16L14 38h8v25h37V38h8L40.5 16z"/>
    <!-- 门 -->
    <rect x="33" y="45" width="15" height="18" rx="1.5"/>
    <!-- 门把手 -->
    <circle cx="44" cy="55" r="1.5" fill="${BRAND.darkGray}"/>
  </g>
</svg>`

  const homeActive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.gold}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40.5 16L14 38h8v25h37V38h8L40.5 16z"/>
    <rect x="33" y="45" width="15" height="18" rx="1.5"/>
    <circle cx="44" cy="55" r="1.5" fill="${BRAND.gold}"/>
  </g>
</svg>`

  icons.push(
    { name: 'tab-home', svg: homeDefault },
    { name: 'tab-home-active', svg: homeActive },
  )

  // --- 抽牌图标 (星形卡片) ---
  const drawDefault = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.darkGray}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- 卡片底 -->
    <rect x="18" y="14" width="32" height="52" rx="3"/>
    <!-- 卡片面（稍偏移叠放效果） -->
    <rect x="26" y="16" width="32" height="52" rx="3"/>
    <!-- 星形符号 -->
    <polygon points="42,32 45,40 53,40 47,45 49,53 42,49 35,53 37,45 31,40 39,40"
             stroke-width="1.5"/>
  </g>
</svg>`

  const drawActive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.gold}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="18" y="14" width="32" height="52" rx="3"/>
    <rect x="26" y="16" width="32" height="52" rx="3"/>
    <polygon points="42,32 45,40 53,40 47,45 49,53 42,49 35,53 37,45 31,40 39,40"
             stroke-width="1.5"/>
  </g>
</svg>`

  icons.push(
    { name: 'tab-draw', svg: drawDefault },
    { name: 'tab-draw-active', svg: drawActive },
  )

  // --- 我的图标 (人物) ---
  const profileDefault = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.darkGray}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- 头部 -->
    <circle cx="40.5" cy="28" r="12"/>
    <!-- 身体 -->
    <path d="M18 65c0-12.7 10.1-23 22.5-23S63 52.3 63 65"/>
  </g>
</svg>`

  const profileActive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 81" width="81" height="81">
  <g fill="none" stroke="${BRAND.gold}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40.5" cy="28" r="12"/>
    <path d="M18 65c0-12.7 10.1-23 22.5-23S63 52.3 63 65"/>
  </g>
</svg>`

  icons.push(
    { name: 'tab-profile', svg: profileDefault },
    { name: 'tab-profile-active', svg: profileActive },
  )

  return icons
}

// ============================================================
// 品牌资源 SVG 生成
// ============================================================

function generateBrandAssets() {
  const assets = []

  // --- Logo: 星形 + 灵谕文字 ---
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80">
  <defs>
    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.lightGold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- 星形符号 -->
  <g transform="translate(30, 40)">
    <!-- 外圈光环 -->
    <circle cx="0" cy="0" r="22" fill="none" stroke="url(#logo-grad)" stroke-width="1" opacity="0.4"/>
    <!-- 八芒星 -->
    <polygon points="0,-18 4,-6 16,-12 8,-2 18,0 8,4 16,14 4,8 0,20 -4,8 -16,14 -8,4 -18,0 -8,-2 -16,-12 -4,-6"
             fill="url(#logo-grad)" opacity="0.9"/>
    <!-- 中心亮点 -->
    <circle cx="0" cy="0" r="4" fill="${BRAND.white}" opacity="0.8"/>
  </g>

  <!-- 灵谕文字 -->
  <text x="75" y="36" font-family="'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif"
        font-size="28" font-weight="700" fill="url(#logo-grad)" letter-spacing="6">
    灵谕
  </text>

  <!-- 副标题 -->
  <text x="75" y="56" font-family="Georgia, 'Times New Roman', serif"
        font-size="11" fill="${BRAND.gray}" letter-spacing="3" opacity="0.8">
    LINGYU TAROT
  </text>

  <!-- 装饰线 -->
  <line x1="75" y1="62" x2="200" y2="62" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.3"/>
</svg>`

  assets.push({ name: 'logo', svg: logo })

  // --- 品牌星形符号 ---
  const star = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.lightGold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:1"/>
    </linearGradient>
  </defs>
  <!-- 四角星 -->
  <polygon points="24,2 28,18 44,18 31,28 35,44 24,34 13,44 17,28 4,18 20,18"
           fill="url(#star-grad)"/>
  <!-- 中心高光 -->
  <circle cx="24" cy="24" r="4" fill="${BRAND.white}" opacity="0.6"/>
</svg>`

  assets.push({ name: 'star', svg: star })

  return assets
}

// ============================================================
// 引导页插画 SVG 生成
// ============================================================

function generateOnboardingAssets() {
  const assets = []

  // --- 引导页1: 星空 + 塔罗牌 (神秘感) ---
  const onboarding1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 400" width="375" height="400">
  <defs>
    <linearGradient id="ob1-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.deepPurple};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.deepBlue};stop-opacity:1"/>
    </linearGradient>
    <radialGradient id="ob1-glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.gold};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="ob1-card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.lightGold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="375" height="400" fill="url(#ob1-bg)"/>
  <rect width="375" height="400" fill="url(#ob1-glow)"/>

  <!-- 星星装饰 -->
  <circle cx="50" cy="40" r="1.5" fill="${BRAND.lightGold}" opacity="0.8"/>
  <circle cx="120" cy="60" r="1" fill="${BRAND.white}" opacity="0.6"/>
  <circle cx="300" cy="35" r="1.5" fill="${BRAND.lightGold}" opacity="0.7"/>
  <circle cx="280" cy="80" r="1" fill="${BRAND.white}" opacity="0.5"/>
  <circle cx="60" cy="100" r="1.2" fill="${BRAND.lightGold}" opacity="0.6"/>
  <circle cx="340" cy="120" r="1" fill="${BRAND.white}" opacity="0.4"/>
  <circle cx="90" cy="150" r="0.8" fill="${BRAND.lightGold}" opacity="0.5"/>
  <circle cx="320" cy="160" r="1.3" fill="${BRAND.white}" opacity="0.6"/>
  <circle cx="40" cy="200" r="1" fill="${BRAND.lightGold}" opacity="0.4"/>
  <circle cx="200" cy="30" r="1.2" fill="${BRAND.white}" opacity="0.7"/>
  <circle cx="160" cy="90" r="0.8" fill="${BRAND.lightGold}" opacity="0.5"/>
  <circle cx="250" cy="50" r="1" fill="${BRAND.white}" opacity="0.6"/>

  <!-- 大星形装饰 -->
  <polygon points="187.5,40 191,55 206,55 194,64 198,79 187.5,70 177,79 181,64 169,55 184,55"
           fill="${BRAND.gold}" opacity="0.3"/>
  <polygon points="60,130 62,138 70,138 64,143 66,151 60,146 54,151 56,143 50,138 58,138"
           fill="${BRAND.lightGold}" opacity="0.2"/>
  <polygon points="310,100 312,108 320,108 314,113 316,121 310,116 304,121 306,113 300,108 308,108"
           fill="${BRAND.lightGold}" opacity="0.2"/>

  <!-- 塔罗牌 - 中间位置 -->
  <g transform="translate(130, 120)">
    <!-- 卡片阴影 -->
    <rect x="8" y="8" width="90" height="140" rx="6" fill="${BRAND.deepPurple}" opacity="0.5"/>
    <!-- 卡片主体 -->
    <rect x="0" y="0" width="90" height="140" rx="6" fill="${BRAND.deepBlue}" stroke="url(#ob1-card)" stroke-width="1.5"/>
    <!-- 卡片内部装饰 -->
    <rect x="6" y="6" width="78" height="128" rx="4" fill="none" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.4"/>
    <!-- 星形符号 -->
    <polygon points="45,35 49,50 64,50 52,59 56,74 45,65 34,74 38,59 26,50 41,50"
             fill="${BRAND.gold}" opacity="0.8"/>
    <!-- 底部文字线 -->
    <line x1="20" y1="100" x2="70" y2="100" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <line x1="25" y1="110" x2="65" y2="110" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.3"/>
    <!-- 顶部编号 -->
    <text x="45" y="24" text-anchor="middle" font-family="Georgia, serif"
          font-size="12" fill="${BRAND.lightGold}" opacity="0.7">XVII</text>
  </g>

  <!-- 散落的小卡片 -->
  <g transform="translate(60, 180) rotate(-15)">
    <rect x="0" y="0" width="55" height="85" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <circle cx="27.5" cy="42" r="10" fill="none" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.4"/>
  </g>

  <g transform="translate(240, 160) rotate(12)">
    <rect x="0" y="0" width="55" height="85" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <polygon points="27.5,25 30,35 40,35 32,41 35,51 27.5,45 20,51 23,41 15,35 25,35"
             fill="${BRAND.gold}" opacity="0.3"/>
  </g>

  <!-- 光芒线条 -->
  <line x1="187.5" y1="90" x2="187.5" y2="110" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.3"/>
  <line x1="150" y1="190" x2="130" y2="210" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.2"/>
  <line x1="225" y1="190" x2="245" y2="210" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.2"/>
</svg>`

  assets.push({ name: 'onboarding-1', svg: onboarding1 })

  // --- 引导页2: AI 解读场景 (科技感) ---
  const onboarding2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 400" width="375" height="400">
  <defs>
    <linearGradient id="ob2-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.deepPurple};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.deepBlue};stop-opacity:1"/>
    </linearGradient>
    <radialGradient id="ob2-glow" cx="50%" cy="50%" r="40%">
      <stop offset="0%" style="stop-color:${BRAND.gold};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect width="375" height="400" fill="url(#ob2-bg)"/>
  <rect width="375" height="400" fill="url(#ob2-glow)"/>

  <!-- 网格线装饰 -->
  <g stroke="${BRAND.gold}" stroke-width="0.3" opacity="0.1">
    <line x1="0" y1="100" x2="375" y2="100"/>
    <line x1="0" y1="200" x2="375" y2="200"/>
    <line x1="0" y1="300" x2="375" y2="300"/>
    <line x1="94" y1="0" x2="94" y2="400"/>
    <line x1="187.5" y1="0" x2="187.5" y2="400"/>
    <line x1="281" y1="0" x2="281" y2="400"/>
  </g>

  <!-- AI 光环 -->
  <circle cx="187.5" cy="170" r="80" fill="none" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.15"/>
  <circle cx="187.5" cy="170" r="60" fill="none" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.2"/>
  <circle cx="187.5" cy="170" r="40" fill="none" stroke="${BRAND.lightGold}" stroke-width="1" opacity="0.25"/>

  <!-- 中心 AI 符号 - 星形电路 -->
  <g transform="translate(187.5, 170)">
    <!-- 核心 -->
    <polygon points="0,-20 5,-7 18,-14 10,-2 22,0 10,5 18,16 5,9 0,22 -5,9 -18,16 -10,5 -22,0 -10,-2 -18,-14 -5,-7"
             fill="none" stroke="${BRAND.gold}" stroke-width="1.2"/>
    <circle cx="0" cy="0" r="6" fill="${BRAND.gold}" opacity="0.6"/>
    <circle cx="0" cy="0" r="3" fill="${BRAND.lightGold}" opacity="0.8"/>

    <!-- 连接线 -->
    <line x1="0" y1="-20" x2="0" y2="-35" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <line x1="22" y1="0" x2="37" y2="0" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <line x1="0" y1="22" x2="0" y2="37" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <line x1="-22" y1="0" x2="-37" y2="0" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>

    <!-- 节点 -->
    <circle cx="0" cy="-37" r="3" fill="${BRAND.lightGold}" opacity="0.5"/>
    <circle cx="37" cy="0" r="3" fill="${BRAND.lightGold}" opacity="0.5"/>
    <circle cx="0" cy="37" r="3" fill="${BRAND.lightGold}" opacity="0.5"/>
    <circle cx="-37" cy="0" r="3" fill="${BRAND.lightGold}" opacity="0.5"/>
  </g>

  <!-- 解读文字气泡 -->
  <g transform="translate(100, 260)">
    <rect x="0" y="0" width="175" height="60" rx="8" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.7"/>
    <line x1="15" y1="18" x2="120" y2="18" stroke="${BRAND.lightGold}" stroke-width="1" opacity="0.4"/>
    <line x1="15" y1="30" x2="100" y2="30" stroke="${BRAND.lightGold}" stroke-width="0.8" opacity="0.3"/>
    <line x1="15" y1="42" x2="80" y2="42" stroke="${BRAND.lightGold}" stroke-width="0.6" opacity="0.2"/>
  </g>

  <!-- 装饰粒子 -->
  <circle cx="80" cy="120" r="2" fill="${BRAND.gold}" opacity="0.3"/>
  <circle cx="290" cy="140" r="1.5" fill="${BRAND.lightGold}" opacity="0.25"/>
  <circle cx="100" cy="240" r="1" fill="${BRAND.gold}" opacity="0.2"/>
  <circle cx="270" cy="250" r="1.5" fill="${BRAND.lightGold}" opacity="0.2"/>
  <circle cx="60" cy="180" r="1" fill="${BRAND.gold}" opacity="0.15"/>
  <circle cx="310" cy="200" r="1.2" fill="${BRAND.lightGold}" opacity="0.2"/>
</svg>`

  assets.push({ name: 'onboarding-2', svg: onboarding2 })

  // --- 引导页3: 开始占卜 (行动引导) ---
  const onboarding3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 400" width="375" height="400">
  <defs>
    <linearGradient id="ob3-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.deepPurple};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.deepBlue};stop-opacity:1"/>
    </linearGradient>
    <radialGradient id="ob3-glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" style="stop-color:${BRAND.gold};stop-opacity:0.12"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="ob3-btn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.lightGold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="375" height="400" fill="url(#ob3-bg)"/>
  <rect width="375" height="400" fill="url(#ob3-glow)"/>

  <!-- 星星装饰 -->
  <circle cx="60" cy="50" r="1.2" fill="${BRAND.lightGold}" opacity="0.6"/>
  <circle cx="310" cy="60" r="1" fill="${BRAND.white}" opacity="0.5"/>
  <circle cx="150" cy="40" r="0.8" fill="${BRAND.lightGold}" opacity="0.4"/>
  <circle cx="250" cy="45" r="1.3" fill="${BRAND.white}" opacity="0.5"/>
  <circle cx="40" cy="150" r="1" fill="${BRAND.lightGold}" opacity="0.3"/>
  <circle cx="340" cy="140" r="0.8" fill="${BRAND.white}" opacity="0.4"/>

  <!-- 手部轮廓 - 洗牌手势 -->
  <g transform="translate(120, 80)" opacity="0.6">
    <!-- 简化的手形 -->
    <path d="M65 100 Q55 80 50 60 Q48 50 52 45 L55 40 Q58 35 62 38 L63 50
             Q65 35 68 30 Q72 25 76 30 L76 50
             Q78 35 82 30 Q86 25 90 30 L88 55
             Q90 40 95 38 Q100 36 102 42 L98 70
             Q100 65 105 65 Q110 65 110 75 L108 100 Q105 110 95 112 L70 112 Q58 110 55 105Z"
          fill="none" stroke="${BRAND.gold}" stroke-width="1.2"/>
  </g>

  <!-- 散落的塔罗牌 -->
  <g transform="translate(80, 180) rotate(-20)">
    <rect x="0" y="0" width="50" height="78" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.6"/>
    <polygon points="25,20 28,30 38,30 30,36 33,46 25,40 17,46 20,36 12,30 22,30"
             fill="${BRAND.gold}" opacity="0.4"/>
  </g>

  <g transform="translate(140, 170) rotate(-5)">
    <rect x="0" y="0" width="50" height="78" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="1" opacity="0.8"/>
    <polygon points="25,20 28,30 38,30 30,36 33,46 25,40 17,46 20,36 12,30 22,30"
             fill="${BRAND.gold}" opacity="0.5"/>
  </g>

  <g transform="translate(200, 175) rotate(8)">
    <rect x="0" y="0" width="50" height="78" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.6"/>
    <circle cx="25" cy="38" r="12" fill="none" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.4"/>
  </g>

  <g transform="translate(250, 185) rotate(18)">
    <rect x="0" y="0" width="50" height="78" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gold}" stroke-width="0.8" opacity="0.5"/>
    <polygon points="25,25 28,35 38,35 30,41 33,51 25,45 17,51 20,41 12,35 22,35"
             fill="${BRAND.gold}" opacity="0.3"/>
  </g>

  <!-- CTA 按钮 -->
  <g transform="translate(100, 310)">
    <rect x="0" y="0" width="175" height="44" rx="22" fill="url(#ob3-btn)"/>
    <text x="87.5" y="28" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
          font-size="15" font-weight="600" fill="${BRAND.deepPurple}" letter-spacing="3">
      开始占卜
    </text>
  </g>

  <!-- 向下箭头指示 -->
  <g transform="translate(187.5, 370)" opacity="0.4">
    <path d="M-6 0 L0 6 L6 0" fill="none" stroke="${BRAND.gold}" stroke-width="1.5" stroke-linecap="round"/>
  </g>
</svg>`

  assets.push({ name: 'onboarding-3', svg: onboarding3 })

  return assets
}

// ============================================================
// 空状态插画 SVG 生成
// ============================================================

function generateEmptyAssets() {
  const assets = []

  // --- 历史记录为空 ---
  const emptyHistory = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="eh-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.gold};stop-opacity:0.08"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- 背景光晕 -->
  <rect width="200" height="200" fill="url(#eh-glow)"/>

  <!-- 牌堆 - 三张叠放的卡片 -->
  <g transform="translate(60, 30)">
    <!-- 底层卡片 -->
    <rect x="8" y="8" width="55" height="85" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.darkGray}" stroke-width="0.8" opacity="0.3"/>
    <!-- 中层卡片 -->
    <rect x="4" y="4" width="55" height="85" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.darkGray}" stroke-width="0.8" opacity="0.5"/>
    <!-- 顶层卡片 -->
    <rect x="0" y="0" width="55" height="85" rx="4" fill="${BRAND.deepBlue}" stroke="${BRAND.gray}" stroke-width="1"/>
    <!-- 问号符号 -->
    <text x="27.5" y="50" text-anchor="middle" font-family="Georgia, serif"
          font-size="28" fill="${BRAND.gray}" opacity="0.5">?</text>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="145" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    暂无历史记录
  </text>
  <text x="100" y="165" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    开始你的第一次占卜吧
  </text>

  <!-- 装饰小星星 -->
  <circle cx="45" cy="50" r="1" fill="${BRAND.gold}" opacity="0.3"/>
  <circle cx="160" cy="60" r="1.2" fill="${BRAND.lightGold}" opacity="0.25"/>
  <circle cx="35" cy="120" r="0.8" fill="${BRAND.gold}" opacity="0.2"/>
  <circle cx="170" cy="130" r="1" fill="${BRAND.lightGold}" opacity="0.2"/>
</svg>`

  assets.push({ name: 'empty-history', svg: emptyHistory })

  // --- 通用空状态 ---
  const emptyGeneral = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="eg-glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" style="stop-color:${BRAND.gold};stop-opacity:0.08"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="eg-star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.lightGold};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${BRAND.gold};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- 背景光晕 -->
  <rect width="200" height="200" fill="url(#eg-glow)"/>

  <!-- 大星形 -->
  <g transform="translate(100, 75)">
    <!-- 外圈 -->
    <circle cx="0" cy="0" r="35" fill="none" stroke="${BRAND.gold}" stroke-width="0.5" opacity="0.2"/>
    <!-- 四角星 -->
    <polygon points="0,-28 6,-10 24,-18 12,-2 30,0 12,6 24,20 6,12 0,30 -6,12 -24,20 -12,6 -30,0 -12,-2 -24,-18 -6,-10"
             fill="none" stroke="url(#eg-star)" stroke-width="1.2" opacity="0.6"/>
    <!-- 中心 -->
    <circle cx="0" cy="0" r="5" fill="${BRAND.gold}" opacity="0.3"/>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="140" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    这里空空如也
  </text>
  <text x="100" y="160" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    暂无相关数据
  </text>

  <!-- 装饰粒子 -->
  <circle cx="40" cy="50" r="1" fill="${BRAND.gold}" opacity="0.2"/>
  <circle cx="165" cy="45" r="1.2" fill="${BRAND.lightGold}" opacity="0.2"/>
  <circle cx="50" cy="110" r="0.8" fill="${BRAND.gold}" opacity="0.15"/>
  <circle cx="155" cy="100" r="1" fill="${BRAND.lightGold}" opacity="0.15"/>
</svg>`

  assets.push({ name: 'empty-general', svg: emptyGeneral })

  return assets
}

// ============================================================
// 错误状态插画 SVG 生成
// ============================================================

function generateErrorAssets() {
  const assets = []

  // --- 网络错误 ---
  const errorNetwork = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="en-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.errorRed};stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:${BRAND.errorRed};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="200" height="200" fill="url(#en-glow)"/>

  <!-- WiFi 信号断开 -->
  <g transform="translate(100, 80)">
    <!-- 信号弧线 (断开效果) -->
    <path d="M-35 10 A50 50 0 0 1 35 10" fill="none" stroke="${BRAND.gray}" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <path d="M-25 20 A35 35 0 0 1 25 20" fill="none" stroke="${BRAND.gray}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <path d="M-15 30 A20 20 0 0 1 15 30" fill="none" stroke="${BRAND.gray}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>

    <!-- 中心点 -->
    <circle cx="0" cy="40" r="4" fill="${BRAND.gray}" opacity="0.7"/>

    <!-- 断开的 X 号 -->
    <line x1="25" y1="-5" x2="40" y2="10" stroke="${BRAND.errorRed}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="-5" x2="25" y2="10" stroke="${BRAND.errorRed}" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="150" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    网络连接失败
  </text>
  <text x="100" y="170" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    请检查网络设置后重试
  </text>
</svg>`

  assets.push({ name: 'error-network', svg: errorNetwork })

  // --- 超时错误 ---
  const errorTimeout = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="et-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.errorRed};stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:${BRAND.errorRed};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="200" height="200" fill="url(#et-glow)"/>

  <!-- 时钟 -->
  <g transform="translate(100, 80)">
    <!-- 外圈 -->
    <circle cx="0" cy="0" r="35" fill="none" stroke="${BRAND.gray}" stroke-width="2" opacity="0.6"/>
    <!-- 内圈 -->
    <circle cx="0" cy="0" r="30" fill="none" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>

    <!-- 刻度 -->
    <line x1="0" y1="-28" x2="0" y2="-24" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.5"/>
    <line x1="28" y1="0" x2="24" y2="0" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.5"/>
    <line x1="0" y1="28" x2="0" y2="24" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.5"/>
    <line x1="-28" y1="0" x2="-24" y2="0" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.5"/>

    <!-- 时针 -->
    <line x1="0" y1="0" x2="-8" y2="-18" stroke="${BRAND.gray}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <!-- 分针 -->
    <line x1="0" y1="0" x2="12" y2="-10" stroke="${BRAND.gray}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    <!-- 中心点 -->
    <circle cx="0" cy="0" r="3" fill="${BRAND.errorRed}" opacity="0.7"/>

    <!-- 超时标记 - 感叹号 -->
    <circle cx="22" cy="22" r="10" fill="${BRAND.errorRed}" opacity="0.8"/>
    <line x1="22" y1="17" x2="22" y2="23" stroke="${BRAND.white}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="22" cy="26" r="1" fill="${BRAND.white}"/>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="150" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    请求超时
  </text>
  <text x="100" y="170" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    服务器响应时间过长
  </text>
</svg>`

  assets.push({ name: 'error-timeout', svg: errorTimeout })

  // --- 服务异常 ---
  const errorServer = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="es-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.errorRed};stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:${BRAND.errorRed};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="200" height="200" fill="url(#es-glow)"/>

  <!-- 服务器机箱 -->
  <g transform="translate(70, 40)">
    <!-- 机箱主体 -->
    <rect x="0" y="0" width="60" height="45" rx="4" fill="none" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.6"/>
    <!-- 分隔线 -->
    <line x1="0" y1="15" x2="60" y2="15" stroke="${BRAND.gray}" stroke-width="0.8" opacity="0.3"/>
    <line x1="0" y1="30" x2="60" y2="30" stroke="${BRAND.gray}" stroke-width="0.8" opacity="0.3"/>
    <!-- 指示灯 -->
    <circle cx="10" cy="8" r="2.5" fill="${BRAND.errorRed}" opacity="0.8"/>
    <circle cx="10" cy="23" r="2.5" fill="${BRAND.errorRed}" opacity="0.8"/>
    <circle cx="10" cy="38" r="2.5" fill="${BRAND.errorRed}" opacity="0.8"/>
    <!-- 通风口 -->
    <line x1="25" y1="6" x2="50" y2="6" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
    <line x1="25" y1="10" x2="50" y2="10" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
    <line x1="25" y1="21" x2="50" y2="21" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
    <line x1="25" y1="25" x2="50" y2="25" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
    <line x1="25" y1="36" x2="50" y2="36" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
    <line x1="25" y1="40" x2="50" y2="40" stroke="${BRAND.gray}" stroke-width="0.5" opacity="0.3"/>
  </g>

  <!-- 第二层服务器 (部分遮挡) -->
  <g transform="translate(75, 88)">
    <rect x="0" y="0" width="60" height="45" rx="4" fill="none" stroke="${BRAND.gray}" stroke-width="1.5" opacity="0.4"/>
    <line x1="0" y1="15" x2="60" y2="15" stroke="${BRAND.gray}" stroke-width="0.8" opacity="0.2"/>
    <line x1="0" y1="30" x2="60" y2="30" stroke="${BRAND.gray}" stroke-width="0.8" opacity="0.2"/>
    <circle cx="10" cy="8" r="2.5" fill="${BRAND.errorRed}" opacity="0.5"/>
  </g>

  <!-- 错误 X 标记 -->
  <g transform="translate(155, 55)">
    <circle cx="0" cy="0" r="12" fill="${BRAND.errorRed}" opacity="0.8"/>
    <line x1="-5" y1="-5" x2="5" y2="5" stroke="${BRAND.white}" stroke-width="2" stroke-linecap="round"/>
    <line x1="5" y1="-5" x2="-5" y2="5" stroke="${BRAND.white}" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="165" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    服务异常
  </text>
  <text x="100" y="185" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    服务器开小差了，请稍后再试
  </text>
</svg>`

  assets.push({ name: 'error-server', svg: errorServer })

  // --- 未知错误 ---
  const errorGeneral = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="eg2-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${BRAND.errorRed};stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:${BRAND.errorRed};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="200" height="200" fill="url(#eg2-glow)"/>

  <!-- 大问号 -->
  <g transform="translate(100, 75)">
    <!-- 圆形背景 -->
    <circle cx="0" cy="0" r="38" fill="none" stroke="${BRAND.gray}" stroke-width="1" opacity="0.2"/>

    <!-- 问号 -->
    <text x="0" y="12" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
          font-size="52" font-weight="bold" fill="${BRAND.gray}" opacity="0.5">?</text>

    <!-- 装饰小问号 -->
    <text x="-28" y="-15" text-anchor="middle" font-family="Georgia, serif"
          font-size="14" fill="${BRAND.darkGray}" opacity="0.3">?</text>
    <text x="30" y="0" text-anchor="middle" font-family="Georgia, serif"
          font-size="12" fill="${BRAND.darkGray}" opacity="0.25">?</text>
    <text x="-20" y="30" text-anchor="middle" font-family="Georgia, serif"
          font-size="10" fill="${BRAND.darkGray}" opacity="0.2">?</text>
  </g>

  <!-- 提示文字 -->
  <text x="100" y="145" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="13" fill="${BRAND.gray}" opacity="0.7">
    出现未知错误
  </text>
  <text x="100" y="165" text-anchor="middle" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif"
        font-size="11" fill="${BRAND.darkGray}" opacity="0.5">
    请返回重试或联系客服
  </text>
</svg>`

  assets.push({ name: 'error-general', svg: errorGeneral })

  return assets
}

// ============================================================
// 主程序
// ============================================================

function main() {
  console.log('灵谕塔罗牌 UI 资源生成器')
  console.log('================================\n')

  // 确保所有目录存在
  console.log('创建目录结构...')
  Object.entries(DIRS).forEach(([name, dir]) => {
    ensureDir(dir)
    console.log(`  ${name}/`)
  })
  console.log('')

  const results = {
    svgCount: 0,
    pngCount: 0,
    pngFailed: false,
  }

  // 1. TabBar 图标
  console.log('生成 TabBar 图标...')
  const tabIcons = generateTabBarIcons()
  tabIcons.forEach(({ name, svg }) => {
    const svgPath = path.join(DIRS.icons, `${name}.svg`)
    writeSvg(svgPath, svg)
    results.svgCount++
    console.log(`  SVG: ${name}.svg`)

    // 尝试生成 PNG
    const pngPath = path.join(DIRS.icons, `${name}.png`)
    const pngOk = writePng(pngPath, svg, 81, 81)
    if (pngOk) {
      results.pngCount++
    } else {
      results.pngFailed = true
    }
  })
  console.log('')

  // 2. 品牌资源
  console.log('生成品牌资源...')
  const brandAssets = generateBrandAssets()
  brandAssets.forEach(({ name, svg }) => {
    const filePath = path.join(DIRS.brand, `${name}.svg`)
    writeSvg(filePath, svg)
    results.svgCount++
    console.log(`  SVG: ${name}.svg`)
  })
  console.log('')

  // 3. 引导页插画
  console.log('生成引导页插画...')
  const onboardingAssets = generateOnboardingAssets()
  onboardingAssets.forEach(({ name, svg }) => {
    const filePath = path.join(DIRS.onboarding, `${name}.svg`)
    writeSvg(filePath, svg)
    results.svgCount++
    console.log(`  SVG: ${name}.svg`)
  })
  console.log('')

  // 4. 空状态插画
  console.log('生成空状态插画...')
  const emptyAssets = generateEmptyAssets()
  emptyAssets.forEach(({ name, svg }) => {
    const filePath = path.join(DIRS.empty, `${name}.svg`)
    writeSvg(filePath, svg)
    results.svgCount++
    console.log(`  SVG: ${name}.svg`)
  })
  console.log('')

  // 5. 错误状态插画
  console.log('生成错误状态插画...')
  const errorAssets = generateErrorAssets()
  errorAssets.forEach(({ name, svg }) => {
    const filePath = path.join(DIRS.error, `${name}.svg`)
    writeSvg(filePath, svg)
    results.svgCount++
    console.log(`  SVG: ${name}.svg`)
  })
  console.log('')

  // 输出统计
  console.log('================================')
  console.log(`SVG 文件: ${results.svgCount} 个`)
  console.log(`PNG 文件: ${results.pngCount} 个`)

  if (results.pngFailed) {
    console.log('')
    console.log('注意: PNG 生成失败 (需要 sharp 或 canvas 库)')
    console.log('TabBar 图标仅生成了 SVG 格式')
    console.log('请手动将 app.config.ts 中的 .png 后缀改为 .svg')
  }

  // 检查 app.config.ts 是否需要更新
  if (results.pngFailed) {
    console.log('')
    console.log('建议操作: 更新 app.config.ts 中的图标路径')
    console.log('  将 .png 改为 .svg')
  }

  console.log('')
  console.log('完成!')
}

main()
