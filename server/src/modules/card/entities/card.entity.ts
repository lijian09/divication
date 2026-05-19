import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 塔罗牌实体
 * 对应数据库 cards 表（78 张静态数据）
 */
@Entity('cards')
export class Card {
  @PrimaryColumn({ type: 'varchar', length: 20, comment: '牌标识，如 major_00, wands_01' })
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '中文名，如"愚人"' })
  name_cn: string;

  @Column({ type: 'varchar', length: 40, comment: '英文名，如"The Fool"' })
  name_en: string;

  @Column({ type: 'varchar', length: 10, comment: '大阿卡纳 major / 小阿卡纳 minor' })
  arcana_type: string;

  @Column({ type: 'varchar', length: 15, nullable: true, comment: '小阿卡纳花色：wands/cups/swords/pentacles' })
  suit: string | null;

  @Column({ type: 'int', comment: '序号（大牌 0-21，小牌 1-14）' })
  number: number;

  @Column({ type: 'varchar', length: 512, comment: '牌面图片 URL' })
  image_url: string;

  @Column({ type: 'varchar', length: 200, comment: '正位关键词，逗号分隔' })
  upright_keywords: string;

  @Column({ type: 'varchar', length: 200, comment: '逆位关键词，逗号分隔' })
  reversed_keywords: string;

  @Column({ type: 'text', comment: '正位详解' })
  upright_meaning: string;

  @Column({ type: 'text', comment: '逆位详解' })
  reversed_meaning: string;

  @Column({ type: 'int', default: 0, comment: '全局排序权重' })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
