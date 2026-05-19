import { registerAs } from '@nestjs/config';

/**
 * 微信小程序 & 支付配置
 */
export default registerAs('wechat', () => ({
  // 小程序
  appId: process.env.WX_APPID,
  secret: process.env.WX_SECRET,
  // 支付
  mchId: process.env.WX_PAY_MCH_ID,
  apiV3Key: process.env.WX_PAY_API_V3_KEY,
  serialNo: process.env.WX_PAY_SERIAL_NO,
  privateKeyPath: process.env.WX_PAY_PRIVATE_KEY_PATH,
  notifyUrl: process.env.WX_PAY_NOTIFY_URL,
}));
