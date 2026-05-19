import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 自定义装饰器 — 从请求中获取当前登录用户信息
 * 用法：@CurrentUser() user
 * 用法：@CurrentUser('id') userId
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了属性名，则返回该属性值
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
