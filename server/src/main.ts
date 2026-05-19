import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get('ConfigService');
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  // 全局前缀
  app.setGlobalPrefix(apiPrefix);

  // 全局管道 — 请求参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离未声明的属性
      forbidNonWhitelisted: true, // 未声明属性直接拒绝
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('灵谕 API')
    .setDescription('灵谕 — AI 塔罗牌小程序后端接口文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '请输入 JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', '认证模块')
    .addTag('user', '用户模块')
    .addTag('divination', '占卜模块')
    .addTag('card', '牌义模块')
    .addTag('order', '订单模块')
    .addTag('quota', '配额模块')
    .addTag('ai', 'AI 解读模块')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port);
  Logger.log(`灵谕服务启动成功: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
  Logger.log(`Swagger 文档地址: http://localhost:${port}/${apiPrefix}/docs`, 'Bootstrap');
}

bootstrap();
