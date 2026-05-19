import { Controller, Post, Body, Sse, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Observable } from 'rxjs';

/**
 * AI 解读控制器
 */
@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * AI 解读（非流式，返回完整内容）
   */
  @Post('interpret')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'AI 解读',
    description: '发送牌面信息和问题，获取 AI 完整解读',
  })
  @ApiResponse({ status: 200, description: '解读成功' })
  async interpret(
    @CurrentUser('id') userId: string,
    @Body() dto: InterpretRequestDto,
  ) {
    return this.aiService.interpret(userId, dto);
  }

  /**
   * AI 解读（SSE 流式接口）
   */
  @Post('interpret/stream')
  @Sse()
  @ApiOperation({
    summary: 'AI 流式解读',
    description: 'SSE 流式返回 AI 解读内容，前端可逐字展示',
  })
  streamInterpret(
    @CurrentUser('id') userId: string,
    @Body() dto: InterpretRequestDto,
  ): Observable<MessageEvent> {
    return this.aiService.interpretStream(userId, dto);
  }
}
