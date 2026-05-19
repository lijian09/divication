import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CardService } from './card.service';
import { CardQueryDto } from './dto/card-query.dto';

/**
 * 牌义控制器
 */
@ApiTags('card')
@ApiBearerAuth('JWT-auth')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  /**
   * 获取所有塔罗牌列表
   */
  @Get()
  @ApiOperation({ summary: '获取塔罗牌列表', description: '返回所有 78 张塔罗牌的牌义数据' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: CardQueryDto) {
    return this.cardService.findAll(query);
  }

  /**
   * 获取单张牌详情（原始数据）
   */
  @Get(':id')
  @ApiOperation({ summary: '获取牌义详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '牌不存在' })
  async findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  /**
   * 获取格式化牌义（按正逆位返回对应关键词和含义）
   * 前端结果页使用
   */
  @Get(':id/detail')
  @ApiOperation({ summary: '获取格式化牌义', description: '根据正逆位返回对应的关键词和解读' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getCardDetail(
    @Param('id') id: string,
    @Query('reversed') reversed: string,
  ) {
    const isReversed = reversed === 'true';
    return this.cardService.getFormattedDetail(id, isReversed);
  }

  /**
   * 获取所有牌阵定义
   */
  @Get('spreads/list')
  @ApiOperation({ summary: '获取牌阵列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getSpreads() {
    return this.cardService.getSpreads();
  }
}
