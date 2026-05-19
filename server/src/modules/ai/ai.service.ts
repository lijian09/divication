import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiInterpretation } from './entities/ai-interpretation.entity';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { Observable, Subscriber } from 'rxjs';

/**
 * AI 解读服务
 * 处理 Prompt 组装、API 调用、内容安全过滤、缓存
 *
 * 核心策略：
 * - Claude 为主，GPT 为降级方案
 * - SSE 流式返回
 * - 内容安全过滤（敏感词替换 + 免责追加）
 * - 相同输入 24 小时缓存
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(AiInterpretation)
    private readonly interpretationRepository: Repository<AiInterpretation>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 非流式 AI 解读（骨架）
   */
  async interpret(userId: string, dto: InterpretRequestDto) {
    this.logger.log(`[DEBUG] 用户 ${userId} 请求 AI 解读`);

    // TODO: 检查 Redis 缓存
    // const cacheKey = this.generateCacheKey(dto);
    // const cached = await this.redisService.get(cacheKey);
    // if (cached) return { content: cached, fromCache: true };

    // 组装 Prompt
    const prompt = this.buildPrompt(dto);

    // TODO: 调用 Claude API
    // let response = await this.callClaude(prompt);
    // if (!response) response = await this.callGpt(prompt);

    // 骨架返回
    const content = '（骨架实现）塔罗牌的指引正在路上...';

    // 内容安全过滤
    const filteredContent = this.filterContent(content);

    // 追加免责声明
    const finalContent = this.appendDisclaimer(filteredContent);

    // TODO: 保存解读记录
    // await this.saveInterpretation(recordId, prompt, content, finalContent, model);

    return {
      content: finalContent,
      fromCache: false,
    };
  }

  /**
   * SSE 流式 AI 解读（骨架）
   */
  interpretStream(
    userId: string,
    dto: InterpretRequestDto,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber: Subscriber<MessageEvent>) => {
      this.handleStreamInterpret(subscriber, userId, dto);
    });
  }

  /**
   * 处理流式解读
   */
  private async handleStreamInterpret(
    subscriber: Subscriber<MessageEvent>,
    userId: string,
    dto: InterpretRequestDto,
  ) {
    this.logger.log(`[DEBUG] 用户 ${userId} 流式解读开始`);

    const prompt = this.buildPrompt(dto);

    // TODO: 调用 Claude API（流式）
    // const stream = await this.callClaudeStream(prompt);
    // for await (const chunk of stream) {
    //   const filtered = this.filterContent(chunk);
    //   subscriber.next({ data: filtered } as MessageEvent);
    // }

    // 骨架：模拟逐字返回
    const mockText = '这是骨架实现的塔罗解读内容，实际将由 AI 模型生成。';
    for (const char of mockText) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      subscriber.next({ data: char } as MessageEvent);
    }

    // 追加免责声明
    subscriber.next({
      data: `\n\n---\n*以上解读由 AI 生成，仅供娱乐参考，不构成任何建议。*`,
    } as MessageEvent);

    subscriber.complete();
    this.logger.log(`[DEBUG] 用户 ${userId} 流式解读完成`);
  }

  /**
   * 组装 Prompt
   */
  private buildPrompt(dto: InterpretRequestDto): string {
    const { question_category, question_text, cards, spread_type } = dto;

    const systemPrompt = `你是一位专业的塔罗牌解读师，拥有深厚的塔罗知识和直觉力。
你的解读风格温暖、富有同理心，同时保持客观和建设性。
请根据用户的问题和抽到的牌，给出详细的解读。

规则：
1. 结合牌面含义和用户的问题进行解读
2. 分析每张牌在对应位置的意义
3. 给出整体总结和建议
4. 避免给出绝对的预测，强调塔罗是提供指引而非定论
5. 语气温暖但保持专业`;

    const cardsDescription = cards
      .map(
        (card, i) =>
          `第 ${i + 1} 张：${card.card_id}（${card.is_reversed ? '逆位' : '正位'}）`,
      )
      .join('\n');

    const userPrompt = `
问题类别：${question_category}
用户问题：${question_text}
牌阵类型：${spread_type}

抽到的牌：
${cardsDescription}

请给出详细的塔罗解读。`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * 内容安全过滤
   */
  private filterContent(content: string): string {
    // TODO: 实现敏感词词库匹配和替换
    // 替换规则：医疗建议 → 建议咨询专业人士
    // 替换规则：绝对预测 → 倾向于引导性表述

    const dangerWords = ['一定会', '绝对不会', '100%', '保证'];
    let filtered = content;

    for (const word of dangerWords) {
      filtered = filtered.replace(new RegExp(word, 'g'), '可能会');
    }

    return filtered;
  }

  /**
   * 追加免责声明
   */
  private appendDisclaimer(content: string): string {
    return `${content}\n\n---\n*以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。请理性对待塔罗牌的指引，生活的选择权始终在你手中。*`;
  }

  /**
   * 生成缓存 key
   */
  private generateCacheKey(dto: InterpretRequestDto): string {
    const input = JSON.stringify({
      category: dto.question_category,
      question: dto.question_text,
      spread: dto.spread_type,
      cards: dto.cards.map((c) => ({ id: c.card_id, rev: c.is_reversed })),
    });
    // TODO: 使用 crypto.createHash('md5').update(input).digest('hex')
    return `ai:cache:${Buffer.from(input).toString('base64').substring(0, 32)}`;
  }

  /**
   * 调用 Claude API（骨架）
   */
  private async callClaude(prompt: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('ai.claude.apiKey');
    const model = this.configService.get<string>('ai.claude.model');

    this.logger.log(`[骨架] 调用 Claude API，模型: ${model}`);

    // TODO: 使用 axios 调用 Claude Messages API
    // const response = await axios.post('https://api.anthropic.com/v1/messages', {
    //   model,
    //   max_tokens: this.configService.get<number>('ai.claude.maxTokens'),
    //   messages: [{ role: 'user', content: prompt }],
    // }, {
    //   headers: {
    //     'x-api-key': apiKey,
    //     'anthropic-version': '2023-06-01',
    //     'content-type': 'application/json',
    //   },
    // });

    return null;
  }

  /**
   * 调用 GPT API 降级（骨架）
   */
  private async callGpt(prompt: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    const model = this.configService.get<string>('ai.openai.model');
    const baseURL = this.configService.get<string>('ai.openai.baseURL');

    this.logger.log(`[骨架] 降级调用 GPT API，模型: ${model}`);

    // TODO: 使用 axios 调用 OpenAI Chat Completions API
    return null;
  }
}
