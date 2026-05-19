import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 牌义查询 DTO
 */
export class CardQueryDto {
  @ApiPropertyOptional({
    description: '大/小阿卡纳筛选',
    enum: ['major', 'minor'],
  })
  @IsOptional()
  @IsIn(['major', 'minor'], { message: 'arcana_type 必须是 major 或 minor' })
  arcana_type?: string;

  @ApiPropertyOptional({
    description: '花色筛选（仅小阿卡纳有效）',
    enum: ['wands', 'cups', 'swords', 'pentacles'],
  })
  @IsOptional()
  @IsIn(['wands', 'cups', 'swords', 'pentacles'], {
    message: 'suit 必须是 wands/cups/swords/pentacles 之一',
  })
  suit?: string;
}
