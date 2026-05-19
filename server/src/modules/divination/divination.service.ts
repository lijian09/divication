import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  PaymentRequiredException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DivinationRecord } from './entities/divination-record.entity';
import { CreateDivinationDto } from './dto/create-divination.dto';
import { DivinationQueryDto } from './dto/divination-query.dto';
import { CardService } from '../card/card.service';
import { QuotaService } from '../quota/quota.service';

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
    private readonly cardService: CardService,
    private readonly quotaService: QuotaService,
  ) {}

  /**
   * 开始占卜 — 抽牌
   * 1. 检查配额 → 扣减配额
   * 2. Fisher-Yates 洗牌 + 随机正逆位
   * 3. 返回抽牌结果
   */
  async draw(userId: string, dto: CreateDivinationDto) {
    this.logger.log(`[DEBUG] 用户 ${userId} 开始占卜: ${JSON.stringify(dto)}`);

    // 1. 检查并扣减配额
    const deductResult = await this.quotaService.deductQuota(userId, dto.spread_type as 'single' | 'three');
    if (deductResult.type === 'none') {
      throw new PaymentRequiredException('配额不足，请购买更多占卜次数');
    }

    // 2. 获取全部 78 张牌
    const allCards = await this.cardService.findAll({});

    // 3. Fisher-Yates 洗牌
    const shuffled = this.fisherYatesShuffle([...allCards]);

    // 4. 抽取指定数量的牌 + 随机正逆位
    const cardCount = dto.spread_type === 'single' ? 1 : 3;
    const positionNames =
      dto.spread_type === 'single'
        ? ['']
        : ['过去', '现在', '未来'];

    const drawnCards = shuffled.slice(0, cardCount).map((card, index) => ({
      card_id: card.id,
      position: index + 1,
      position_name: positionNames[index],
      is_reversed: Math.random() < 0.5,
      name_cn: card.name_cn,
      name_en: card.name_en,
      upright_keywords: card.upright_keywords,
      reversed_keywords: card.reversed_keywords,
      image_url: card.image_url,
    }));

    // 5. 生成 sessionId
    const sessionId = uuidv4();

    // 6. 保存占卜记录
    const record = this.recordRepository.create({
      user_id: userId,
      question_category: dto.question_category,
      question_text: dto.question_text,
      spread_type: dto.spread_type,
      cards: drawnCards.map((c) => ({
        card_id: c.card_id,
        position: c.position,
        position_name: c.position_name,
        is_reversed: c.is_reversed,
      })),
      ai_model: 'pending',
      status: 'pending',
    });

    await this.recordRepository.save(record);

    this.logger.log(
      `[DEBUG] 用户 ${userId} 抽牌成功，${cardCount} 张，扣减类型: ${deductResult.type}`,
    );

    return {
      sessionId,
      recordId: record.id,
      spread_type: dto.spread_type,
      cards: drawnCards.map((c) => ({
        id: c.card_id,
        name: c.name_cn,
        nameEn: c.name_en,
        position: c.position,
        positionName: c.position_name,
        isReversed: c.is_reversed,
        keywords: c.is_reversed ? c.reversed_keywords : c.upright_keywords,
        imageUrl: c.image_url,
      })),
      quotaType: deductResult.type,
    };
  }

  /**
   * Fisher-Yates 洗牌算法
   * 原地随机交换，保证每张牌等概率出现在任意位置
   */
  private fisherYatesShuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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
