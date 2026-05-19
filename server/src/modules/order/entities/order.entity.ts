import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * 订单实体
 * 对应数据库 orders 表
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: '业务订单号' })
  order_no: string;

  @Column({ type: 'varchar', length: 36, comment: '用户 ID' })
  user_id: string;

  @Column({ type: 'varchar', length: 36, comment: '套餐 ID' })
  package_id: string;

  @Column({ type: 'varchar', length: 40, comment: '套餐名称（冗余）' })
  package_name: string;

  @Column({ type: 'int', comment: '支付金额（单位：分）' })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY', comment: '货币' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    comment: 'pending/paid/refunded/failed/cancelled',
  })
  status: string;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '微信支付交易号' })
  wx_transaction_id: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true, comment: '微信预支付 ID' })
  wx_prepay_id: string | null;

  @Column({ type: 'datetime', nullable: true, comment: '支付完成时间' })
  paid_at: Date | null;

  @Column({ type: 'int', default: 0, comment: '回调处理尝试次数' })
  notify_attempts: number;

  @CreateDateColumn({ comment: '下单时间' })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ========== 关联关系 ==========

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
