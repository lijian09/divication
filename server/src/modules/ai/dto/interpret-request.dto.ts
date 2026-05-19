import { IsString, IsNotEmpty, IsArray, IsBoolean, IsIn, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 抽牌信息 DTO
 */
class CardInfoDto {
  @ApiProperty({ description: '牌 ID', example: 'major_00' })
  @IsString()
  @IsNotEmpty({ message: '牌 ID 不能为空' })
  card_id: string;

  @ApiProperty({ description: '位置序号', example: 1 })
  position: number;

  @ApiProperty({ description: '位置名称', example: '核心主题' })
  @IsString()
  position_name: string;

  @ApiProperty({ description: '是否逆位', example: false })
  @IsBoolean()
  is_reversed: boolean;
}

/**
 * AI 解读请求 DTO
 */
export class InterpretRequestDto {
  @ApiProperty({
    description: '问题类别',
    enum: ['love', 'career', 'finance', 'health', 'general'],
    example: 'love',
  })
  @IsString()
  @IsNotEmpty({ message: '问题类别不能为空' })
  @IsIn(['love', 'career', 'finance', 'health', 'general'], {
    message: '问题类别必须是 love/career/finance/health/general 之一',
  })
  question_category: string;

  @ApiProperty({
    description: '用户问题',
    example: '我和他的感情会如何发展？',
  })
  @IsString()
  @IsNotEmpty({ message: '问题不能为空' })
  @MaxLength(100, { message: '问题最多 100 个汉字' })
  question_text: string;

  @ApiProperty({
    description: '牌阵类型',
    enum: ['single', 'three'],
    example: 'single',
  })
  @IsString()
  @IsNotEmpty({ message: '牌阵类型不能为空' })
  @IsIn(['single', 'three'], {
    message: '牌阵类型必须是 single 或 three',
  })
  spread_type: string;

  @ApiProperty({
    description: '抽到的牌信息',
    type: [CardInfoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardInfoDto)
  cards: CardInfoDto[];
}
