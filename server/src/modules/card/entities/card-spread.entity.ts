import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpreadPosition } from './spread-position.entity';

/**
 * 牌阵定义实体
 * 对应数据库 card_spreads 表
 */
@Entity('card_spreads')
export class CardSpread {
  @PrimaryColumn({ type: 'varchar', length: 36, comment: '主键，UUID' })
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '牌阵名称，如"单牌阵"、"三牌阵"' })
  name: string;

  @Column({ type: 'varchar', length: 10, unique: true, comment: '牌阵类型标识：single/three' })
  type: string;

  @Column({ type: 'varchar', length: 200, comment: '牌阵说明' })
  description: string;

  @Column({ type: 'int', comment: '需要抽取的牌数' })
  position_count: number;

  @Column({ type: 'tinyint', width: 1, default: 1, comment: '是否启用' })
  is_active: boolean;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  // ========== 关联关系 ==========

  @OneToMany(() => SpreadPosition, (position) => position.spread)
  positions: SpreadPosition[];
}
