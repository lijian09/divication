import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 付费套餐实体
 * 对应数据库 packages 表
 */
@Entity('packages')
export class Package {
  @PrimaryColumn({ type: 'varchar', length: 36, comment: '主键，UUID' })
  id: string;

  @Column({ type: 'varchar', length: 40, comment: '套餐名称' })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '套餐标识码' })
  code: string;

  @Column({ type: 'int', comment: '价格（单位：分）' })
  price: number;

  @Column({ type: 'int', comment: '包含单牌次数' })
  single_count: number;

  @Column({ type: 'int', comment: '包含三牌次数' })
  three_count: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '套餐描述' })
  description: string | null;

  @Column({ type: 'tinyint', width: 1, default: 1, comment: '是否上架' })
  is_active: boolean;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
