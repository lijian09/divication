import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CardSpread } from '../../card/entities/card-spread.entity';
import { AiInterpretation } from '../../ai/entities/ai-interpretation.entity';

/**
 * 占卜记录实体
 * 对应数据库 divination_records 表
 */
@Entity('divination_records')
export class DivinationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, comment: '用户 ID' })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '问题类别：love/career/finance/health/general',
  })
  question_category: string;

  @Column({ type: 'varchar', length: 400, comment: '用户问题原文' })
  question_text: string;

  @Column({ type: 'varchar', length: 10, comment: '牌阵类型：single/three' })
  spread_type: string;

  @Column({ type: 'varchar', length: 36, nullable: true, comment: '关联牌阵定义 ID' })
  spread_id: string | null;

  @Column({
    type: 'json',
    comment: '抽到的牌列表：[{card_id, position, is_reversed, position_name}]',
  })
  cards: Array<{
    card_id: string;
    position: number;
    position_name: string;
    is_reversed: boolean;
  }>;

  @Column({ type: 'varchar', length: 50, comment: '使用的 AI 模型标识' })
  ai_model: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'completed',
    comment: '状态：pending/completed/failed',
  })
  status: string;

  @CreateDateColumn({ comment: '占卜时间' })
  created_at: Date;

  // ========== 关联关系 ==========

  @ManyToOne(() => User, (user) => user.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CardSpread)
  @JoinColumn({ name: 'spread_id' })
  spread: CardSpread;

  @OneToOne(() => AiInterpretation, (interpretation) => interpretation.record)
  aiInterpretation: AiInterpretation;
}
