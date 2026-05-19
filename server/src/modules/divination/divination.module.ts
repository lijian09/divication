import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivinationController } from './divination.controller';
import { DivinationService } from './divination.service';
import { DivinationRecord } from './entities/divination-record.entity';

/**
 * 占卜模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([DivinationRecord])],
  controllers: [DivinationController],
  providers: [DivinationService],
  exports: [DivinationService],
})
export class DivinationModule {}
