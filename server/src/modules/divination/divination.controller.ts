import { Controller, Post, Get, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DivinationService } from './divination.service';
import { CreateDivinationDto } from './dto/create-divination.dto';
import { DivinationQueryDto } from './dto/divination-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 占卜控制器
 */
@ApiTags('divination')
@ApiBearerAuth('JWT-auth')
@Controller('divination')
export class DivinationController {
  constructor(private readonly divinationService: DivinationService) {}

  /**
   * 开始占卜（抽牌）
   */
  @Post('draw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '开始占卜', description: '抽取塔罗牌，返回抽牌结果' })
  @ApiResponse({ status: 200, description: '抽牌成功' })
  @ApiResponse({ status: 402, description: '配额不足' })
  async draw(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDivinationDto,
  ) {
    return this.divinationService.draw(userId, dto);
  }

  /**
   * 获取占卜历史列表
   */
  @Get('records')
  @ApiOperation({ summary: '获取占卜历史', description: '分页查询占卜记录' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query() query: DivinationQueryDto,
  ) {
    return this.divinationService.getHistory(userId, query);
  }

  /**
   * 获取占卜详情
   */
  @Get('records/:id')
  @ApiOperation({ summary: '获取占卜详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async getDetail(
    @CurrentUser('id') userId: string,
    @Param('id') recordId: string,
  ) {
    return this.divinationService.getDetail(userId, recordId);
  }
}
