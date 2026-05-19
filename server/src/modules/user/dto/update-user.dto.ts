import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户信息 DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称', example: '灵谕用户' })
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: '昵称最多 80 个字符' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512, { message: '头像 URL 最多 512 个字符' })
  avatar_url?: string;

  @ApiPropertyOptional({ description: '性别：0-未知 1-男 2-女', enum: [0, 1, 2] })
  @IsOptional()
  gender?: number;
}
