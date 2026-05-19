import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuotaService } from './quota.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 配额控制器
 */
@ApiTags('quota')
@ApiBearerAuth('JWT-auth')
@Controller('quota')
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  /**
   * 获取当前用户配额
   */
  @Get()
  @ApiOperation({ summary: '获取用户配额', description: '查询当前用户的免费和付费剩余次数' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getQuota(@CurrentUser('id') userId: string) {
    return this.quotaService.getQuota(userId);
  }
}
