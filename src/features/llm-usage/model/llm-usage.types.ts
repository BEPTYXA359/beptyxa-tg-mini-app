export type LlmUsageSource =
  | 'chat'
  | 'chatterbox'
  | 'inline_chat'
  | 'inline_router'
  | 'currency_parse';

export type LlmUsageProvider = 'OpenAi' | 'Groq';

export interface LlmUsageTotals {
  requests: number;
  promptTokens: number;
  completionTokens: number;
}

export interface LlmUsageModelBreakdown extends LlmUsageTotals {
  provider: LlmUsageProvider;
  model: string;
}

export interface LlmUsageSourceBreakdown extends LlmUsageTotals {
  source: LlmUsageSource;
  provider: LlmUsageProvider;
}

export interface LlmUsageDayBreakdown extends LlmUsageTotals {
  day: string;
}

export interface LlmUsageSummary {
  today: LlmUsageTotals;
  month: LlmUsageTotals;
  byModel: LlmUsageModelBreakdown[];
  bySource: LlmUsageSourceBreakdown[];
  days: LlmUsageDayBreakdown[];
}

export const PROVIDER_LABELS: Record<LlmUsageProvider, string> = {
  OpenAi: 'ChatGPT',
  Groq: 'Groq',
};

export const SOURCE_LABELS: Record<LlmUsageSource, string> = {
  chat: 'Чат',
  chatterbox: 'Балабол',
  inline_chat: 'Inline-ответы',
  inline_router: 'Inline-роутинг',
  currency_parse: 'Разбор запроса конвертера',
};
