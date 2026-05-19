import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 查询配额 DTO
 */
export class QueryQuotaDto {
  @ApiPropertyOptional({
    description: '牌阵类型筛选',
    enum: ['single', 'three'],
    example: 'single',
  })
  @IsOptional()
  @IsString()
  @IsIn(['single', 'three'], {
    message: '牌阵类型必须是 single 或 three',
  })
  spread_type?: string;
}
