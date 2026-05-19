import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库模块
 * 配置 TypeORM 连接 MySQL
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true, // 自动加载通过 TypeOrmModule.forFeature 注册的实体
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        charset: 'utf8mb4',
        timezone: '+08:00',
        // 连接池配置
        extra: {
          connectionLimit: 20,
          waitForConnections: true,
          queueLimit: 0,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
