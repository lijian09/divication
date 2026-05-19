import { IsOptional, IsIn, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 占卜记录查询 DTO
 */
export class DivinationQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @IsNumberString({}, { message: 'page 必须是数字' })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  @IsOptional()
  @IsNumberString({}, { message: 'pageSize 必须是数字' })
  pageSize?: number;

  @ApiPropertyOptional({
    description: '问题类别筛选',
    enum: ['love', 'career', 'finance', 'health', 'general'],
  })
  @IsOptional()
  @IsIn(['love', 'career', 'finance', 'health', 'general'])
  category?: string;

  @ApiPropertyOptional({
    description: '牌阵类型筛选',
    enum: ['single', 'three'],
  })
  @IsOptional()
  @IsIn(['single', 'three'])
  spread_type?: string;
}
