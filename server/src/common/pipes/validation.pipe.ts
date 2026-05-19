import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * 全局参数校验管道
 * 使用 class-validator 对请求参数进行校验
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 如果不需要校验（基础类型或无元类型），直接返回
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 将普通对象转换为类实例，触发 class-validator 装饰器
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints || {}),
      );
      this.logger.warn(`[校验失败] ${JSON.stringify(messages)}`);
      throw new BadRequestException(messages);
    }

    return value;
  }

  /**
   * 判断是否需要校验
   * 跳过基础类型（String, Boolean, Number, Array, Object）
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
