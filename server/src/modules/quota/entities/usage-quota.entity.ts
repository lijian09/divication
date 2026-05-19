import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * 使用配额实体
 * 对应数据库 usage_quotas 表
 */
@Entity('usage_quotas')
export class UsageQuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, unique: true, comment: '用户 ID' })
  user_id: string;

  @Column({ type: 'int', default: 1, comment: '当日免费单牌剩余次数' })
  free_single_remaining: number;

  @Column({ type: 'int', default: 1, comment: '当日免费三牌剩余次数（新用户首日 1 次，日常 0）' })
  free_three_remaining: number;

  @Column({ type: 'date', comment: '免费次数刷新日期' })
  free_reset_date: string;

  @Column({ type: 'int', default: 0, comment: '付费单牌剩余次数' })
  paid_single_remaining: number;

  @Column({ type: 'int', default: 0, comment: '付费三牌剩余次数' })
  paid_three_remaining: number;

  @Column({ type: 'int', default: 0, comment: '历史累计消耗付费单牌次数' })
  total_paid_single_used: number;

  @Column({ type: 'int', default: 0, comment: '历史累计消耗付费三牌次数' })
  total_paid_three_used: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ========== 关联关系 ==========

  @OneToOne(() => User, (user) => user.quota, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
