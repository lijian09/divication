/**
 * 全局小程序配置
 * 页面路由、TabBar、窗口样式
 */
export default defineAppConfig({
  // 全局窗口配置（神秘深色主题）
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A0A2E',
    navigationBarTitleText: '灵谕',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1A0A2E',
  },
  // 页面路由注册
  pages: [
    'pages/home/index',
    'pages/onboarding/index',
    'pages/question-select/index',
    'pages/spread-select/index',
    'pages/shuffle/index',
    'pages/pick-card/index',
    'pages/reveal/index',
    'pages/result-single/index',
    'pages/result-three/index',
    'pages/profile/index',
    'pages/history-list/index',
    'pages/history-detail/index',
    'pages/packages/index',
    'pages/payment-result/index',
    'pages/settings/index',
    'pages/loading/index',
    'pages/error/index',
  ],
  // 底部 TabBar：首页 / 抽牌 / 我的
  tabBar: {
    custom: false,
    color: '#6B6580',
    selectedColor: '#D4A843',
    backgroundColor: '#0D1B3E',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/images/icons/tab-home.png',
        selectedIconPath: 'assets/images/icons/tab-home-active.png',
      },
      {
        pagePath: 'pages/shuffle/index',
        text: '抽牌',
        iconPath: 'assets/images/icons/tab-draw.png',
        selectedIconPath: 'assets/images/icons/tab-draw-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/images/icons/tab-profile.png',
        selectedIconPath: 'assets/images/icons/tab-profile-active.png',
      },
    ],
  },
})

/** Taro app.config.ts 的类型辅助 */
function defineAppConfig(config: any) {
  return config
}
