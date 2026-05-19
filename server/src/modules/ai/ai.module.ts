import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiInterpretation } from './entities/ai-interpretation.entity';

/**
 * AI 解读模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([AiInterpretation])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
