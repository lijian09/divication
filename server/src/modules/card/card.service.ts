import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CardSpread } from './entities/card-spread.entity';
import { CardQueryDto } from './dto/card-query.dto';

/**
 * 牌义服务
 */
@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(CardSpread)
    private readonly spreadRepository: Repository<CardSpread>,
  ) {}

  /**
   * 查询所有牌义（支持筛选）
   */
  async findAll(query: CardQueryDto) {
    const { arcana_type, suit } = query;

    const qb = this.cardRepository
      .createQueryBuilder('card')
      .orderBy('card.sort_order', 'ASC');

    if (arcana_type) {
      qb.andWhere('card.arcana_type = :arcana_type', { arcana_type });
    }

    if (suit) {
      qb.andWhere('card.suit = :suit', { suit });
    }

    // TODO: Redis 缓存全量牌义数据（TTL 24h）
    return qb.getMany();
  }

  /**
   * 查询单张牌义
   */
  async findOne(id: string) {
    // TODO: 先查 Redis 缓存
    const card = await this.cardRepository.findOne({ where: { id } });

    if (!card) {
      throw new NotFoundException(`牌义 ${id} 不存在`);
    }

    return card;
  }

  /**
   * 获取格式化牌义（按正逆位返回对应关键词和含义）
   */
  async getFormattedDetail(id: string, isReversed: boolean) {
    const card = await this.findOne(id);

    return {
      id: card.id,
      nameCn: card.name_cn,
      nameEn: card.name_en,
      arcanaType: card.arcana_type,
      suit: card.suit,
      number: card.number,
      imageUrl: card.image_url,
      isReversed,
      keywords: isReversed ? card.reversed_keywords : card.upright_keywords,
      meaning: isReversed ? card.reversed_meaning : card.upright_meaning,
    };
  }

  /**
   * 获取所有启用的牌阵
   */
  async getSpreads() {
    return this.spreadRepository.find({
      where: { is_active: true },
      relations: ['positions'],
      order: { sort_order: 'ASC' },
    });
  }
}
