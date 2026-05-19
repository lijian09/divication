import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DivinationModule } from './modules/divination/divination.module';
import { CardModule } from './modules/card/card.module';
import { OrderModule } from './modules/order/order.module';
import { QuotaModule } from './modules/quota/quota.module';
import { AiModule } from './modules/ai/ai.module';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import wechatConfig from './config/wechat.config';
import aiConfig from './config/ai.config';

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, redisConfig, jwtConfig, wechatConfig, aiConfig],
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 数据库
    DatabaseModule,

    // 业务模块
    AuthModule,
    UserModule,
    DivinationModule,
    CardModule,
    OrderModule,
    QuotaModule,
    AiModule,
  ],
})
export class AppModule {}
