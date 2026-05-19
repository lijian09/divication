import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotaController } from './quota.controller';
import { QuotaService } from './quota.service';
import { UsageQuota } from './entities/usage-quota.entity';

/**
 * 配额模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([UsageQuota])],
  controllers: [QuotaController],
  providers: [QuotaService],
  exports: [QuotaService],
})
export class QuotaModule {}
