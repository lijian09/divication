import { registerAs } from '@nestjs/config';

/**
 * AI 服务配置
 */
export default registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER || 'claude',
  // Claude API
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS, 10) || 4096,
  },
  // OpenAI API（备用）
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
}));
