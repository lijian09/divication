import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivinationController } from './divination.controller';
import { DivinationService } from './divination.service';
import { DivinationRecord } from './entities/divination-record.entity';
import { CardModule } from '../card/card.module';
import { QuotaModule } from '../quota/quota.module';

/**
 * 占卜模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DivinationRecord]),
    CardModule,
    QuotaModule,
  ],
  controllers: [DivinationController],
  providers: [DivinationService],
  exports: [DivinationService],
})
export class DivinationModule {}
