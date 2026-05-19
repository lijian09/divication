import { registerAs } from '@nestjs/config';

/**
 * JWT 配置
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-dev-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));
