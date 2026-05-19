import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageQuota } from './entities/usage-quota.entity';

/**
 * 配额服务
 * 处理配额查询、扣减、发放
 *
 * 核心策略：
 * - Redis 做热缓存（DECRBY 原子扣减）
 * - MySQL 做持久化
 * - Write-Through 策略：扣减/发放时同时更新 Redis 和 MySQL
 */
@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(
    @InjectRepository(UsageQuota)
    private readonly quotaRepository: Repository<UsageQuota>,
  ) {}

  /**
   * 获取用户配额
   */
  async getQuota(userId: string) {
    // TODO: 先查 Redis 缓存
    // const cached = await this.redisService.hgetall(`quota:${userId}`);
    // if (cached) return cached;

    let quota = await this.quotaRepository.findOne({
      where: { user_id: userId },
    });

    if (!quota) {
      // 首次查询时自动创建配额记录
      quota = await this.initQuota(userId);
    }

    return {
      free_single_remaining: quota.free_single_remaining,
      free_three_remaining: quota.free_three_remaining,
      paid_single_remaining: quota.paid_single_remaining,
      paid_three_remaining: quota.paid_three_remaining,
      free_reset_date: quota.free_reset_date,
    };
  }

  /**
   * 初始化用户配额（新用户默认 1 次免费）
   */
  async initQuota(userId: string): Promise<UsageQuota> {
    const quota = this.quotaRepository.create({
      user_id: userId,
      free_single_remaining: 1,
      free_three_remaining: 1,
      paid_single_remaining: 0,
      paid_three_remaining: 0,
      free_reset_date: new Date().toISOString().split('T')[0] as any,
    });

    const saved = await this.quotaRepository.save(quota);

    // TODO: 同步写入 Redis
    // await this.redisService.hset(`quota:${userId}`, ...);

    this.logger.log(`[DEBUG] 用户 ${userId} 配额初始化完成`);
    return saved;
  }

  /**
   * 扣减配额
   * @param userId 用户 ID
   * @param spreadType single 或 three
   */
  async deductQuota(userId: string, spreadType: 'single' | 'three') {
    // TODO: Redis 原子扣减
    // const key = `quota:${userId}`;
    // const field = spreadType === 'single' ? 'free_single_remaining' : 'free_three_remaining';
    // const newValue = await this.redisService.hincrby(key, field, -1);

    const quota = await this.getQuota(userId);
    const isSingle = spreadType === 'single';

    // 优先消耗免费次数
    if (isSingle && quota.free_single_remaining > 0) {
      await this.quotaRepository.increment(
        { user_id: userId },
        'free_single_remaining',
        -1,
      );
      this.logger.log(`[DEBUG] 扣减免费单牌次数，用户: ${userId}`);
      return { type: 'free' };
    }

    if (!isSingle && quota.free_three_remaining > 0) {
      await this.quotaRepository.increment(
        { user_id: userId },
        'free_three_remaining',
        -1,
      );
      this.logger.log(`[DEBUG] 扣减免费三牌次数，用户: ${userId}`);
      return { type: 'free' };
    }

    // 免费用完，消耗付费次数
    if (isSingle && quota.paid_single_remaining > 0) {
      await this.quotaRepository.decrement(
        { user_id: userId },
        'paid_single_remaining',
        1,
      );
      await this.quotaRepository.increment(
        { user_id: userId },
        'total_paid_single_used',
        1,
      );
      this.logger.log(`[DEBUG] 扣减付费单牌次数，用户: ${userId}`);
      return { type: 'paid' };
    }

    if (!isSingle && quota.paid_three_remaining > 0) {
      await this.quotaRepository.decrement(
        { user_id: userId },
        'paid_three_remaining',
        1,
      );
      await this.quotaRepository.increment(
        { user_id: userId },
        'total_paid_three_used',
        1,
      );
      this.logger.log(`[DEBUG] 扣减付费三牌次数，用户: ${userId}`);
      return { type: 'paid' };
    }

    // 配额不足
    return { type: 'none' };
  }

  /**
   * 增加付费配额（支付成功后调用）
   */
  async addPaidQuota(
    userId: string,
    singleCount: number,
    threeCount: number,
  ) {
    await this.quotaRepository.increment(
      { user_id: userId },
      'paid_single_remaining',
      singleCount,
    );
    await this.quotaRepository.increment(
      { user_id: userId },
      'paid_three_remaining',
      threeCount,
    );

    // TODO: 同步更新 Redis
    this.logger.log(
      `[DEBUG] 用户 ${userId} 增加付费配额: 单牌 +${singleCount}, 三牌 +${threeCount}`,
    );
  }

  /**
   * 每日重置免费次数（定时任务调用）
   */
  async resetDailyFreeQuota() {
    const today = new Date().toISOString().split('T')[0];

    // 更新所有非今天的配额记录
    await this.quotaRepository
      .createQueryBuilder()
      .update(UsageQuota)
      .set({
        free_single_remaining: 1,
        free_three_remaining: 0, // 非新用户首日，三牌免费次数为 0
        free_reset_date: today as any,
      })
      .where('free_reset_date != :today', { today })
      .execute();

    // TODO: 清除 Redis 缓存，下次查询时自动回填
    this.logger.log(`[DEBUG] 每日免费配额重置完成，日期: ${today}`);
  }
}
