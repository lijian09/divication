import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 微信登录 DTO
 */
export class WxLoginDto {
  @ApiProperty({ description: '微信小程序 wx.login() 获取的临时 code', example: '0a3b1c2d3e4f5g6h' })
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}
