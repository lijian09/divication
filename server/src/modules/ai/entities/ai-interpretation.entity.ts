import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DivinationRecord } from '../../divination/entities/divination-record.entity';

/**
 * AI 解读结果实体
 * 对应数据库 ai_interpretations 表
 */
@Entity('ai_interpretations')
export class AiInterpretation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, unique: true, comment: '关联占卜记录 ID' })
  record_id: string;

  @Column({ type: 'text', comment: '发送给 AI 的完整 Prompt' })
  prompt_text: string;

  @Column({ type: 'text', comment: 'AI 原始返回内容（含免责追加前）' })
  raw_content: string;

  @Column({ type: 'text', comment: '安全过滤后的内容（最终展示给用户）' })
  filtered_content: string;

  @Column({ type: 'varchar', length: 50, comment: '实际使用的 AI 模型' })
  model: string;

  @Column({ type: 'int', nullable: true, default: 0, comment: 'Prompt Token 消耗' })
  prompt_tokens: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: 'Completion Token 消耗' })
  completion_tokens: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '总 Token 消耗' })
  total_tokens: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: 'AI 响应耗时（毫秒）' })
  latency_ms: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'success',
    comment: 'success/filtered/fallback/error',
  })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '错误信息' })
  error_message: string | null;

  @CreateDateColumn()
  created_at: Date;

  // ========== 关联关系 ==========

  @OneToOne(() => DivinationRecord, (record) => record.aiInterpretation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'record_id' })
  record: DivinationRecord;
}
