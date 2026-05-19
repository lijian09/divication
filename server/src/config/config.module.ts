import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

/**
 * 配置模块
 * 集中管理所有环境变量配置
 */
@Global()
@Module({
  imports: [NestConfigModule],
})
export class ConfigModule {}
