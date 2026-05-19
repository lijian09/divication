import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建占卜 DTO
 */
export class CreateDivinationDto {
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
}
