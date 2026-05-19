import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 确认免责协议 DTO
 */
export class AcceptAgreementDto {
  @ApiProperty({
    description: '协议版本号',
    example: '1.0',
  })
  @IsString()
  @IsNotEmpty({ message: '协议版本号不能为空' })
  agreement_version: string;

  @ApiPropertyOptional({
    description: '客户端标识（可选）',
    example: 'wechat-mini-program',
  })
  @IsOptional()
  @IsString()
  client_type?: string;
}
