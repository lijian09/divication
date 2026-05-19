import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiInterpretation } from './entities/ai-interpretation.entity';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { CardService } from '../card/card.service';
import { Observable, Subscriber } from 'rxjs';

// ========== 敏感词库 ==========
const DANGER_WORDS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /一定会/g, replacement: '可能会' },
  { pattern: /绝对不会/g, replacement: '可能不太会' },
  { pattern: /100%/g, replacement: '很大概率' },
  { pattern: /保证/g, replacement: '倾向于' },
  { pattern: /必然/g, replacement: '大概率' },
  { pattern: /注定/g, replacement: '机缘巧合' },
  { pattern: /命中注定/g, replacement: '缘分使然' },
];

// 医疗/法律/投资等专业领域词 → 引导用户咨询专业人士
const PROFESSIONAL_DOMAINS: Array<{ pattern: RegExp; hint: string }> = [
  { pattern: /癌症|肿瘤|绝症/g, hint: '健康问题建议咨询专业医生' },
  { pattern: /离婚|官司|诉讼/g, hint: '法律问题建议咨询专业律师' },
  { pattern: /股票|基金|投资回报/g, hint: '投资决策建议咨询专业理财顾问' },
];

// ========== 问题类别映射 ==========
const CATEGORY_LABELS: Record<string, string> = {
  love: '爱情',
  career: '事业',
  finance: '财运',
  health: '健康',
  general: '综合运势',
};

// ========== 预设模板解读（降级方案）==========
const PRESET_INTERPRETATIONS: Record<string, string[]> = {
  love: [
    '这张牌暗示你目前的感情状态正处在一个关键的转折点。牌面的能量提醒你，真诚的沟通是打开彼此心门的钥匙。试着放下防备，用你最真实的一面去面对这段关系。感情的发展需要双方共同的投入和耐心，保持信心，美好的变化正在路上。',
    '牌面显示你的感情之路虽然可能面临一些小考验，但这些都是成长的契机。记住，每段感情都会经历磨合期。保持开放的心态，倾听内心的声音，你会找到属于自己的答案。',
  ],
  career: [
    '这张牌为你的职业发展带来了一个重要的信号。当前你可能正面临一个选择或转变的节点。牌面鼓励你相信自己的能力和判断力，勇敢地迈出下一步。新的机遇往往出现在你最意想不到的时刻。',
    '牌面能量提示你，目前的工作状态可能需要一些调整。不要害怕改变，有时候一个小小的方向调整就能带来巨大的突破。专注于提升自己的核心竞争力，机会自然会来。',
  ],
  finance: [
    '从牌面的能量来看，你的财运正处于一个需要审慎规划的阶段。这张牌提醒你，稳定的积累比冒险的投机更能带来长久的收益。合理安排收支，保持耐心，财务状况会逐步改善。',
    '牌面暗示近期可能会有一些小的财务波动，但不必过于担心。这是一个学习理财的好时机。审慎评估每一个财务决策，量入为出，你会发现自己的经济状况在不知不觉中变得更好。',
  ],
  health: [
    '这张牌提醒你关注身心的平衡。牌面的能量暗示你可能最近有些疲惫或压力较大。试着给自己一些放松的时间，保持规律的作息和适当的运动。身体是革命的本钱，好好照顾自己。',
    '牌面显示你的整体健康状况良好，但需要注意劳逸结合。有时候，内心的平静比外在的忙碌更重要。保持积极乐观的心态，健康自然会与你同行。',
  ],
  general: [
    '这张牌为你揭示了当前的整体能量状态。牌面暗示你正站在一个新的起点上，前方有无限的可能等待你去探索。保持好奇心和勇气，你的人生旅程正在迎来一个重要的阶段。',
    '牌面的能量温和而有力，提醒你相信自己的直觉和判断。当前的你可能正在经历一些变化，但这些都是成长的必经之路。接纳变化，拥抱未知，你会发现自己比想象中更加强大。',
  ],
};

/**
 * AI 解读服务
 * 处理 Prompt 组装、API 调用、内容安全过滤、缓存
 *
 * 核心策略：
 * - Claude 为主，GPT 为降级方案
 * - 两者都失败时返回预设模板解读
 * - 内容安全过滤（敏感词替换 + 专业领域引导）
 * - 追加免责声明
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(AiInterpretation)
    private readonly interpretationRepository: Repository<AiInterpretation>,
    private readonly configService: ConfigService,
    private readonly cardService: CardService,
  ) {}

  /**
   * 非流式 AI 解读
   */
  async interpret(userId: string, dto: InterpretRequestDto) {
    this.logger.log(`[DEBUG] 用户 ${userId} 请求 AI 解读: ${dto.spread_type}`);

    // 组装 Prompt（注入真实牌义）
    const { prompt, cardNames } = await this.buildPrompt(dto);

    // 调用 AI（Claude → GPT → 预设模板）
    const startTime = Date.now();
    const { content, model, status, errorMessage } = await this.callAi(prompt);
    const latencyMs = Date.now() - startTime;

    // 内容安全过滤
    const filteredContent = this.filterContent(content);

    // 追加免责声明
    const finalContent = this.appendDisclaimer(filteredContent);

    // 保存解读记录
    const interpretation = await this.saveInterpretation(
      dto.recordId,
      prompt,
      content,
      finalContent,
      model,
      status,
      errorMessage,
      latencyMs,
    );

    return {
      content: finalContent,
      cardNames,
      model,
      status,
      fromCache: false,
      interpretationId: interpretation.id,
    };
  }

  /**
   * SSE 流式 AI 解读
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

    try {
      const { prompt } = await this.buildPrompt(dto);
      const startTime = Date.now();

      // 尝试 Claude 流式
      let streamSuccess = await this.streamClaude(subscriber, prompt);

      // Claude 失败 → 尝试 GPT 流式
      if (!streamSuccess) {
        streamSuccess = await this.streamGpt(subscriber, prompt);
      }

      // 都失败 → 逐字发送预设模板
      if (!streamSuccess) {
        await this.streamFallback(subscriber, dto);
      }

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[DEBUG] 用户 ${userId} 流式解读完成，耗时: ${latencyMs}ms`);
    } catch (error: any) {
      this.logger.error(`[DEBUG] 流式解读异常: ${error.message}`);
      subscriber.next({ data: JSON.stringify({ error: '解读服务暂时不可用' }) } as MessageEvent);
    } finally {
      subscriber.complete();
    }
  }

  // ==================== Prompt 组装 ====================

  /**
   * 组装完整 Prompt（注入真实牌义）
   */
  private async buildPrompt(dto: InterpretRequestDto): Promise<{
    prompt: string;
    cardNames: string[];
  }> {
    const { question_category, question_text, cards, spread_type } = dto;
    const categoryLabel = CATEGORY_LABELS[question_category] || question_category;

    // 查询每张牌的完整牌义
    const cardDetails = await Promise.all(
      cards.map(async (card) => {
        const detail = await this.cardService.getFormattedDetail(card.card_id, card.is_reversed);
        return {
          ...card,
          nameCn: detail.nameCn,
          nameEn: detail.nameEn,
          keywords: detail.keywords,
          meaning: detail.meaning,
          arcanaType: detail.arcanaType,
          suit: detail.suit,
        };
      }),
    );

    const cardNames = cardDetails.map((c) => c.nameCn);

    // System prompt
    const systemPrompt = this.getSystemPrompt(spread_type);

    // User prompt — 牌面信息
    const cardsDescription = cardDetails
      .map((card, i) => {
        const position = spread_type === 'three'
          ? `（${card.position_name}）`
          : '';
        const suitInfo = card.suit ? ` · ${card.suit}` : '';
        return `第 ${i + 1} 张：${card.nameCn}（${card.nameEn}）${position}
  ${card.is_reversed ? '逆位' : '正位'}${suitInfo}
  关键词：${card.keywords}
  牌义：${card.meaning}`;
      })
      .join('\n\n');

    const userPrompt = `【用户问题】
类别：${categoryLabel}
问题：${question_text}
牌阵：${spread_type === 'three' ? '三牌阵（过去/现在/未来）' : '单牌阵'}

【抽到的牌】
${cardsDescription}

请根据以上牌面信息和用户问题，给出详细的塔罗解读。`;

    return {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      cardNames,
    };
  }

  /**
   * System Prompt 模板
   */
  private getSystemPrompt(spreadType: string): string {
    const baseRules = `你是一位温暖而专业的塔罗牌解读师，拥有深厚的塔罗知识和直觉力。
你的解读风格温暖、富有同理心，同时保持客观和建设性。

## 解读规则
1. 严格基于牌面含义和用户问题进行解读，不要编造牌义
2. 语气温暖但保持专业，像一位知心朋友在分享智慧
3. 避免给出绝对的预测，强调塔罗是提供指引而非定论
4. 给出具体、可操作的建议，不要泛泛而谈
5. 控制解读长度在 200-400 字之间
6. 不要使用"命中注定"、"必然"等绝对化表述
7. 不要提供医疗、法律、投资等专业领域建议`;

    if (spreadType === 'three') {
      return `${baseRules}

## 三牌阵解读结构
请按以下结构组织解读：
1. 先用 1-2 句话概括三张牌的整体能量走向
2. 依次解读"过去"、"现在"、"未来"每张牌在对应位置的意义（每段 2-3 句）
3. 最后给出综合建议（2-3 句）`;
    }

    return `${baseRules}

## 单牌解读结构
请按以下结构组织解读：
1. 先用 1-2 句话点明这张牌的核心信息
2. 结合用户问题详细解读牌义（3-5 句）
3. 最后给出一个具体的行动建议（1-2 句）`;
  }

  // ==================== AI 调用 ====================

  /**
   * 统一 AI 调用入口：Claude → GPT → 预设模板
   */
  private async callAi(prompt: string): Promise<{
    content: string;
    model: string;
    status: string;
    errorMessage: string | null;
  }> {
    // 尝试 Claude
    try {
      const claudeResult = await this.callClaude(prompt);
      if (claudeResult) {
        return { content: claudeResult, model: 'claude-sonnet-4', status: 'success', errorMessage: null };
      }
    } catch (err: any) {
      this.logger.warn(`[DEBUG] Claude 调用失败: ${err.message}`);
    }

    // 尝试 GPT
    try {
      const gptResult = await this.callGpt(prompt);
      if (gptResult) {
        return { content: gptResult, model: 'gpt-4o', status: 'success', errorMessage: null };
      }
    } catch (err: any) {
      this.logger.warn(`[DEBUG] GPT 调用失败: ${err.message}`);
    }

    // 降级：预设模板
    this.logger.warn('[DEBUG] AI 全部失败，使用预设模板');
    return {
      content: this.getFallbackContent(prompt),
      model: 'fallback',
      status: 'fallback',
      errorMessage: 'AI 服务不可用，使用预设解读',
    };
  }

  /**
   * 调用 Claude Messages API
   */
  private async callClaude(prompt: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('ai.claude.apiKey');
    if (!apiKey) {
      this.logger.warn('[DEBUG] Claude API Key 未配置，跳过');
      return null;
    }

    const model = this.configService.get<string>('ai.claude.model') || 'claude-sonnet-4-20250514';
    const maxTokens = this.configService.get<number>('ai.claude.maxTokens') || 4096;

    this.logger.log(`[DEBUG] 调用 Claude API，模型: ${model}`);

    // 分离 system 和 user prompt
    const parts = prompt.split('\n\n');
    const systemPart = parts[0];
    const userPart = parts.slice(1).join('\n\n');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: maxTokens,
        system: systemPart,
        messages: [{ role: 'user', content: userPart }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const text = response.data?.content?.[0]?.text;
    if (!text) {
      throw new Error('Claude 返回内容为空');
    }

    return text;
  }

  /**
   * 调用 OpenAI / GPT API（降级方案）
   */
  private async callGpt(prompt: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    if (!apiKey) {
      this.logger.warn('[DEBUG] OpenAI API Key 未配置，跳过');
      return null;
    }

    const model = this.configService.get<string>('ai.openai.model') || 'gpt-4o';
    const baseURL = this.configService.get<string>('ai.openai.baseURL') || 'https://api.openai.com/v1';

    this.logger.log(`[DEBUG] 降级调用 GPT API，模型: ${model}`);

    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('GPT 返回内容为空');
    }

    return text;
  }

  // ==================== 流式调用 ====================

  /**
   * Claude SSE 流式调用
   */
  private async streamClaude(
    subscriber: Subscriber<MessageEvent>,
    prompt: string,
  ): Promise<boolean> {
    const apiKey = this.configService.get<string>('ai.claude.apiKey');
    if (!apiKey) return false;

    const model = this.configService.get<string>('ai.claude.model') || 'claude-sonnet-4-20250514';

    try {
      const parts = prompt.split('\n\n');
      const systemPart = parts[0];
      const userPart = parts.slice(1).join('\n\n');

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          max_tokens: 4096,
          system: systemPart,
          messages: [{ role: 'user', content: userPart }],
          stream: true,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 60000,
          responseType: 'stream',
        },
      );

      return new Promise<boolean>((resolve) => {
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                subscriber.next({ data: JSON.stringify({ done: true }) } as MessageEvent);
                resolve(true);
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const text = parsed.delta?.text;
                if (text) {
                  const filtered = this.filterContent(text);
                  subscriber.next({ data: JSON.stringify({ content: filtered }) } as MessageEvent);
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }
        });

        response.data.on('end', () => {
          subscriber.next({ data: JSON.stringify({ done: true }) } as MessageEvent);
          resolve(true);
        });

        response.data.on('error', (err: Error) => {
          this.logger.error(`[DEBUG] Claude 流式异常: ${err.message}`);
          resolve(false);
        });
      });
    } catch (err: any) {
      this.logger.warn(`[DEBUG] Claude 流式初始化失败: ${err.message}`);
      return false;
    }
  }

  /**
   * GPT SSE 流式调用
   */
  private async streamGpt(
    subscriber: Subscriber<MessageEvent>,
    prompt: string,
  ): Promise<boolean> {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    if (!apiKey) return false;

    const model = this.configService.get<string>('ai.openai.model') || 'gpt-4o';
    const baseURL = this.configService.get<string>('ai.openai.baseURL') || 'https://api.openai.com/v1';

    try {
      const response = await axios.post(
        `${baseURL}/chat/completions`,
        {
          model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
          responseType: 'stream',
        },
      );

      return new Promise<boolean>((resolve) => {
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                subscriber.next({ data: JSON.stringify({ done: true }) } as MessageEvent);
                resolve(true);
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  const filtered = this.filterContent(text);
                  subscriber.next({ data: JSON.stringify({ content: filtered }) } as MessageEvent);
                }
              } catch {
                // 忽略
              }
            }
          }
        });

        response.data.on('end', () => {
          subscriber.next({ data: JSON.stringify({ done: true }) } as MessageEvent);
          resolve(true);
        });

        response.data.on('error', () => resolve(false));
      });
    } catch (err: any) {
      this.logger.warn(`[DEBUG] GPT 流式初始化失败: ${err.message}`);
      return false;
    }
  }

  /**
   * 流式降级：逐字发送预设模板
   */
  private async streamFallback(
    subscriber: Subscriber<MessageEvent>,
    dto: InterpretRequestDto,
  ) {
    const content = this.getFallbackContent('');
    const filtered = this.filterContent(content);
    const final = this.appendDisclaimer(filtered);

    // 逐字发送，模拟流式效果
    for (const char of final) {
      subscriber.next({ data: JSON.stringify({ content: char }) } as MessageEvent);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    subscriber.next({ data: JSON.stringify({ done: true }) } as MessageEvent);
  }

  /**
   * 获取预设模板解读（降级方案）
   */
  private getFallbackContent(_prompt: string): string {
    // 从 prompt 中提取类别信息
    const categoryMatch = _prompt.match(/类别：(\S+)/);
    const categoryKey = Object.keys(CATEGORY_LABELS).find(
      (key) => CATEGORY_LABELS[key] === categoryMatch?.[1],
    ) || 'general';

    const templates = PRESET_INTERPRETATIONS[categoryKey] || PRESET_INTERPRETATIONS.general;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // ==================== 安全过滤 ====================

  /**
   * 内容安全过滤
   * 1. 替换绝对化表述
   * 2. 检测专业领域内容并引导
   * 3. 移除 Markdown 格式标记
   */
  private filterContent(content: string): string {
    let filtered = content;

    // 替换绝对化表述
    for (const rule of DANGER_WORDS) {
      filtered = filtered.replace(rule.pattern, rule.replacement);
    }

    // 检测专业领域
    for (const domain of PROFESSIONAL_DOMAINS) {
      if (domain.pattern.test(filtered)) {
        this.logger.warn(`[DEBUG] 检测到专业领域内容: ${domain.hint}`);
        // 不直接替换，而是在末尾追加引导
        if (!filtered.includes(domain.hint)) {
          filtered += `\n\n温馨提示：${domain.hint}。`;
        }
      }
    }

    return filtered;
  }

  /**
   * 追加免责声明
   */
  private appendDisclaimer(content: string): string {
    return `${content}\n\n---\n*以上解读由 AI 生成，仅供娱乐参考，不构成任何专业建议。请理性对待塔罗牌的指引，生活的选择权始终在你手中。*`;
  }

  // ==================== 持久化 ====================

  /**
   * 保存解读记录
   */
  private async saveInterpretation(
    recordId: string,
    prompt: string,
    rawContent: string,
    filteredContent: string,
    model: string,
    status: string,
    errorMessage: string | null,
    latencyMs: number,
  ) {
    const interpretation = this.interpretationRepository.create({
      record_id: recordId,
      prompt_text: prompt,
      raw_content: rawContent,
      filtered_content: filteredContent,
      model,
      status,
      error_message: errorMessage,
      latency_ms: latencyMs,
    });

    return this.interpretationRepository.save(interpretation);
  }
}
