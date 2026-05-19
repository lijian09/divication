import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

/**
 * TypeORM CLI 数据源配置
 * 供 migration:generate / migration:run 等 CLI 命令使用
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'lingyu',
  password: process.env.DB_PASSWORD || 'lingyu_dev_2026',
  database: process.env.DB_DATABASE || 'lingyu',
  charset: 'utf8mb4',
  timezone: '+08:00',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  logging: process.env.DB_LOGGING === 'true',
});
