import { IsString, IsOptional } from 'class-validator';

/**
 * 微信支付回调 DTO
 * 实际格式按微信支付 V3 回调报文定义
 */
export class PayCallbackDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  create_time?: string;

  @IsString()
  @IsOptional()
  event_type?: string;

  @IsString()
  @IsOptional()
  resource_type?: string;

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  summary?: string;
}
