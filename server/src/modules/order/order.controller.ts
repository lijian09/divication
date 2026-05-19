import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayCallbackDto } from './dto/pay-callback.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/constants';

/**
 * 订单控制器
 */
@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 获取可用套餐列表
   */
  @Public()
  @Get('packages')
  @ApiOperation({ summary: '获取可用套餐列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getPackages() {
    return this.orderService.getPackages();
  }

  /**
   * 创建订单
   */
  @Post('create')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建订单', description: '选择套餐创建支付订单' })
  @ApiResponse({ status: 200, description: '创建成功，返回支付参数' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  /**
   * 查询订单状态
   */
  @Get(':orderNo')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '查询订单状态' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getOrder(
    @CurrentUser('id') userId: string,
    @Param('orderNo') orderNo: string,
  ) {
    return this.orderService.getOrder(userId, orderNo);
  }

  /**
   * 微信支付回调
   */
  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信支付回调', description: '微信支付异步通知接口' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async payCallback(@Body() dto: PayCallbackDto) {
    return this.orderService.handlePayCallback(dto);
  }
}
