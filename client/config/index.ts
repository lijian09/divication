import { defineConfig, UserConfig } from '@tarojs/cli'

/**
 * Taro 编译配置入口
 * 微信小程序主配置
 */
const config: UserConfig<'webpack5'> = {
  projectName: 'lingyu-miniapp',
  date: '2026-5-19',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  // 全局 Sass 变量注入
  sass: {
    data: `@import "@styles/variables.scss";@import "@styles/mixins.scss";`,
  },
  compiler: 'webpack5',
  cache: {
    enable: false,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 小于 1KB 的图片转为 base64
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    webpackChain(chain) {
      // 路径别名
      chain.resolve.alias
        .set('@', require('path').resolve(__dirname, '..', 'src'))
        .set('@components', require('path').resolve(__dirname, '..', 'src/components'))
        .set('@pages', require('path').resolve(__dirname, '..', 'src/pages'))
        .set('@services', require('path').resolve(__dirname, '..', 'src/services'))
        .set('@store', require('path').resolve(__dirname, '..', 'src/store'))
        .set('@utils', require('path').resolve(__dirname, '..', 'src/utils'))
        .set('@styles', require('path').resolve(__dirname, '..', 'src/styles'))
        .set('@assets', require('path').resolve(__dirname, '..', 'src/assets'))
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    postcss: {
      autoprefixer: {
        enable: true,
      },
      cssModules: {
        enable: false,
      },
    },
    webpackChain(chain) {
      chain.resolve.alias
        .set('@', require('path').resolve(__dirname, '..', 'src'))
        .set('@components', require('path').resolve(__dirname, '..', 'src/components'))
        .set('@pages', require('path').resolve(__dirname, '..', 'src/pages'))
        .set('@services', require('path').resolve(__dirname, '..', 'src/services'))
        .set('@store', require('path').resolve(__dirname, '..', 'src/store'))
        .set('@utils', require('path').resolve(__dirname, '..', 'src/utils'))
        .set('@styles', require('path').resolve(__dirname, '..', 'src/styles'))
        .set('@assets', require('path').resolve(__dirname, '..', 'src/assets'))
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
