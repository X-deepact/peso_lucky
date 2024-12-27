/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const DEV_API_URL =
  process.env.PLATFORM === 'CNONTROL'
    ? 'https://dev-ctrl.bingominigame.com'
    : process.env.PLATFORM === 'MERCHANT'
    ? // ? 'https://front-ts2.vipsroom.net'
      'https://dev-admin.bingominigame.com'
    : '';

const TEST_API_URL =
  process.env.PLATFORM === 'CNONTROL'
    ? 'https://test-ctrl.bingominigame.com'
    : process.env.PLATFORM === 'MERCHANT'
    ? // ? 'https://front-ts2-test.vipsroom.net'
      'https://test-admin.bingominigame.com'
    : '';
export default {
  dev: {
    '/api/': {
      // 要代理的地址
      target: DEV_API_URL ?? 'http://localhost:8888',
      // target: 'https://proapi.azurewebsites.net',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
    },
  },
  test: {
    '/api/': {
      target: TEST_API_URL,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
