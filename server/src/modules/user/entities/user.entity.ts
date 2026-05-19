import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UsageQuota } from '../../quota/entities/usage-quota.entity';
import { DivinationRecord } from '../../divination/entities/divination-record.entity';
import { Order } from '../../order/entities/order.entity';

/**
 * 用户实体
 * 对应数据库 users 表
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: '微信 OpenID' })
  openid: string;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '微信 UnionID' })
  unionid: string | null;

  @Column({ type: 'varchar', length: 80, default: '灵谕用户', comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: '头像 URL' })
  avatar_url: string | null;

  @Column({ type: 'tinyint', default: 0, comment: '性别：0-未知 1-男 2-女' })
  gender: number;

  @Column({ type: 'tinyint', width: 1, default: 0, comment: '是否同意免责协议' })
  agreement_accepted: boolean;

  @Column({ type: 'datetime', nullable: true, comment: '协议同意时间' })
  agreement_accepted_at: Date | null;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-正常 0-禁用 -1-注销' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  last_login_at: Date | null;

  @CreateDateColumn({ comment: '注册时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;

  // ========== 关联关系 ==========

  @OneToOne(() => UsageQuota, (quota) => quota.user)
  quota: UsageQuota;

  @OneToMany(() => DivinationRecord, (record) => record.user)
  records: DivinationRecord[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
