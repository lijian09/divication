import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 接口限流中间件（骨架）
 * 生产环境使用 Redis 实现滑动窗口限流
 *
 * Key 格式: ratelimit:{api}:{userId}:{window}
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  /**
   * 各接口的限流配置
   * { 窗口内最大请求数, 窗口大小（秒） }
   */
  private readonly limits: Record<string, { max: number; window: number }> = {
    '/auth/login': { max: 10, window: 60 },
    '/divination/draw': { max: 5, window: 60 },
    '/ai/interpret': { max: 3, window: 60 },
    '/order/create': { max: 10, window: 60 },
    default: { max: 60, window: 60 },
  };

  use(req: Request, _res: Response, next: NextFunction) {
    // TODO: 接入 Redis 实现滑动窗口限流
    // 当前骨架直接放行，实现时替换为 Redis INCR + EXPIRE
    this.logger.debug(`[RateLimit] ${req.method} ${req.url} - 放行（骨架实现）`);
    next();
  }

  /**
   * 根据请求路径获取限流配置
   */
  private getLimitConfig(path: string) {
    for (const [route, config] of Object.entries(this.limits)) {
      if (route !== 'default' && path.includes(route)) {
        return config;
      }
    }
    return this.limits['default'];
  }

  /**
   * 限流异常
   */
  private throwRateLimitError() {
    throw new HttpException(
      {
        code: HttpStatus.TOO_MANY_REQUESTS,
        message: '请求过于频繁，请稍后再试',
        data: null,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
