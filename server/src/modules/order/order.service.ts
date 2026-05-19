import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Package } from './entities/package.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayCallbackDto } from './dto/pay-callback.dto';

/**
 * 订单服务
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  /**
   * 获取所有上架的套餐
   */
  async getPackages() {
    return this.packageRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    this.logger.log(`[DEBUG] 用户 ${userId} 创建订单: ${dto.package_id}`);

    // 查询套餐
    const pkg = await this.packageRepository.findOne({
      where: { id: dto.package_id, is_active: true },
    });

    if (!pkg) {
      throw new BadRequestException('套餐不存在或已下架');
    }

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 创建订单记录
    const order = this.orderRepository.create({
      order_no: orderNo,
      user_id: userId,
      package_id: pkg.id,
      package_name: pkg.name,
      amount: pkg.price,
      currency: 'CNY',
      status: 'pending',
    });

    await this.orderRepository.save(order);

    // TODO: 调用微信支付统一下单接口（JSAPI）
    // const wxPayResult = await this.wxPayService.unifiedOrder({...});

    this.logger.log(`[DEBUG] 订单创建成功: ${orderNo}`);

    return {
      order_no: orderNo,
      amount: pkg.price,
      package_name: pkg.name,
      // TODO: 返回微信支付参数
      // payParams: { timeStamp, nonceStr, package, signType, paySign }
      message: '订单创建成功（骨架实现，未对接微信支付）',
    };
  }

  /**
   * 查询订单状态
   */
  async getOrder(userId: string, orderNo: string) {
    const order = await this.orderRepository.findOne({
      where: { order_no: orderNo, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 处理微信支付回调
   */
  async handlePayCallback(dto: PayCallbackDto) {
    this.logger.log(`[DEBUG] 收到支付回调: ${JSON.stringify(dto)}`);

    // TODO: 验签
    // TODO: 解密回调数据（微信支付 V3 AEAD）
    // TODO: 幂等处理 — 只处理 status=pending 的订单
    // TODO: 验证金额一致
    // TODO: 更新订单状态 → 发放配额（数据库事务）

    this.logger.warn('[骨架] 支付回调处理（骨架实现）');
    return { code: 'SUCCESS', message: 'OK' };
  }

  /**
   * 生成业务订单号
   * 格式：LY + 时间戳 + 随机数
   */
  private generateOrderNo(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `LY${timestamp}${random}`.toUpperCase();
  }
}
