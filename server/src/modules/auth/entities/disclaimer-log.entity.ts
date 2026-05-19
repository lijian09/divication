import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * 免责协议确认记录实体
 * 对应数据库 disclaimer_logs 表
 * 记录用户每次确认免责协议的行为（含 IP、设备信息）
 */
@Entity('disclaimer_logs')
export class DisclaimerLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, comment: '用户 ID' })
  user_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true, comment: '客户端 IP' })
  ip_address: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: 'User-Agent' })
  user_agent: string | null;

  @Column({ type: 'varchar', length: 20, default: '1.0', comment: '协议版本号' })
  agreement_version: string;

  @CreateDateColumn({ comment: '确认时间' })
  created_at: Date;

  // ========== 关联关系 ==========

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
