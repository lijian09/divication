import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DivinationRecord } from './entities/divination-record.entity';
import { CreateDivinationDto } from './dto/create-divination.dto';
import { DivinationQueryDto } from './dto/divination-query.dto';

/**
 * 占卜服务
 * 处理抽牌、记录、历史查询
 */
@Injectable()
export class DivinationService {
  private readonly logger = new Logger(DivinationService.name);

  constructor(
    @InjectRepository(DivinationRecord)
    private readonly recordRepository: Repository<DivinationRecord>,
  ) {}

  /**
   * 开始占卜 — 抽牌
   * 1. 检查配额（需注入 QuotaService）
   * 2. Fisher-Yates 洗牌 + 随机正逆位
   * 3. 返回抽牌结果，暂存 Redis
   */
  async draw(userId: string, dto: CreateDivinationDto) {
    this.logger.log(`[DEBUG] 用户 ${userId} 开始占卜: ${JSON.stringify(dto)}`);

    // TODO: 检查配额 → 扣减配额
    // TODO: Fisher-Yates 洗牌算法
    // TODO: 抽牌结果暂存 Redis（TTL 30 分钟）

    // 骨架返回
    const sessionId = `session_${Date.now()}`;
    return {
      sessionId,
      spread_type: dto.spread_type,
      cardCount: dto.spread_type === 'single' ? 1 : 3,
      message: '抽牌成功（骨架实现）',
    };
  }

  /**
   * 查询占卜历史（分页）
   */
  async getHistory(userId: string, query: DivinationQueryDto) {
    const { page = 1, pageSize = 20, category, spread_type } = query;

    const qb = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user_id = :userId', { userId })
      .orderBy('record.created_at', 'DESC');

    if (category) {
      qb.andWhere('record.question_category = :category', { category });
    }

    if (spread_type) {
      qb.andWhere('record.spread_type = :spread_type', { spread_type });
    }

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取占卜详情
   */
  async getDetail(userId: string, recordId: string) {
    const record = await this.recordRepository.findOne({
      where: { id: recordId },
      relations: ['aiInterpretation'],
    });

    if (!record) {
      throw new NotFoundException('占卜记录不存在');
    }

    if (record.user_id !== userId) {
      throw new ForbiddenException('无权查看他人占卜记录');
    }

    return record;
  }
}
