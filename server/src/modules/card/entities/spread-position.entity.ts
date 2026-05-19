import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CardSpread } from './card-spread.entity';

/**
 * 牌阵位置定义实体
 * 对应数据库 spread_positions 表
 */
@Entity('spread_positions')
export class SpreadPosition {
  @PrimaryColumn({ type: 'varchar', length: 36, comment: '主键，UUID' })
  id: string;

  @Column({ type: 'varchar', length: 36, comment: '关联牌阵 ID' })
  spread_id: string;

  @Column({ type: 'int', comment: '位置序号（从 1 开始）' })
  position_index: number;

  @Column({ type: 'varchar', length: 20, comment: '位置名称，如"过去"、"现在"、"未来"' })
  position_name: string;

  @Column({ type: 'varchar', length: 200, comment: '位置含义说明' })
  description: string;

  // ========== 关联关系 ==========

  @ManyToOne(() => CardSpread, (spread) => spread.positions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spread_id' })
  spread: CardSpread;
}
