import { defineConfig, UserConfig } from '@tarojs/cli'
import path from 'path'

/**
 * Taro 编译配置 — F-509 性能优化
 * 代码分包 + Tree Shaking + 图片优化
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
  sass: {
    data: `@import "@styles/variables.scss";@import "@styles/mixins.scss";`,
  },
  compiler: 'webpack5',
  cache: {
    enable: true, // 开启编译缓存
    type: 'filesystem',
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
          limit: 2048, // 小于 2KB 的图片转为 base64（减少请求）
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
        .set('@', path.resolve(__dirname, '..', 'src'))
        .set('@components', path.resolve(__dirname, '..', 'src/components'))
        .set('@pages', path.resolve(__dirname, '..', 'src/pages'))
        .set('@services', path.resolve(__dirname, '..', 'src/services'))
        .set('@store', path.resolve(__dirname, '..', 'src/store'))
        .set('@utils', path.resolve(__dirname, '..', 'src/utils'))
        .set('@styles', path.resolve(__dirname, '..', 'src/styles'))
        .set('@assets', path.resolve(__dirname, '..', 'src/assets'))

      // ==================== 代码分包优化 ====================

      // 1. 分离 node_modules 中的公共依赖
      chain.optimization.splitChunks({
        chunks: 'all',
        minSize: 10000,
        maxSize: 250000,
        cacheGroups: {
          // Taro 框架核心
          taro: {
            test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
            name: 'taro',
            priority: 30,
            reuseExistingChunk: true,
          },
          // React 运行时
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Zustand 状态管理
          zustand: {
            test: /[\\/]node_modules[\\/]zustand[\\/]/,
            name: 'zustand',
            priority: 20,
            reuseExistingChunk: true,
          },
          // 其余 node_modules
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      })

      // 2. 生产环境压缩优化
      if (process.env.NODE_ENV === 'production') {
        chain.optimization.minimize(true)
        chain.optimization.minimizer('terser').tap((args: any[]) => {
          args[0].terserOptions.compress = {
            ...args[0].terserOptions.compress,
            drop_console: true, // 移除 console.log
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug'],
          }
          return args
        })
      }
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
        .set('@', path.resolve(__dirname, '..', 'src'))
        .set('@components', path.resolve(__dirname, '..', 'src/components'))
        .set('@pages', path.resolve(__dirname, '..', 'src/pages'))
        .set('@services', path.resolve(__dirname, '..', 'src/services'))
        .set('@store', path.resolve(__dirname, '..', 'src/store'))
        .set('@utils', path.resolve(__dirname, '..', 'src/utils'))
        .set('@styles', path.resolve(__dirname, '..', 'src/styles'))
        .set('@assets', path.resolve(__dirname, '..', 'src/assets'))
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
