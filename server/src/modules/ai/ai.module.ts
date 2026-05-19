import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiInterpretation } from './entities/ai-interpretation.entity';
import { CardModule } from '../card/card.module';

/**
 * AI 解读模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([AiInterpretation]), CardModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
