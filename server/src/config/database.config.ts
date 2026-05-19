import { registerAs } from '@nestjs/config';

/**
 * 数据库配置
 */
export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'lingyu',
  password: process.env.DB_PASSWORD || 'lingyu_dev_2026',
  database: process.env.DB_DATABASE || 'lingyu',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));
