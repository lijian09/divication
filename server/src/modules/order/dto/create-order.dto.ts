import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建订单 DTO
 */
export class CreateOrderDto {
  @ApiProperty({ description: '套餐 ID', example: 'pkg_small' })
  @IsString()
  @IsNotEmpty({ message: '套餐 ID 不能为空' })
  package_id: string;
}
