export interface LlmProviderMeta {
  id: string;
  label: string;
  defaultTrigger: string;
  hasApiKeyField: boolean;
  keyPlaceholder?: string;
  defaultModel?: string;
}

export const LLM_PROVIDERS_META: LlmProviderMeta[] = [
  {
    id: 'OpenAi',
    label: 'OpenAI (ChatGPT)',
    defaultTrigger: 'чатгпт',
    hasApiKeyField: true,
    keyPlaceholder: 'sk-...',
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'Groq',
    label: 'Groq',
    defaultTrigger: 'грок',
    hasApiKeyField: false,
  },
  {
    id: 'Glm',
    label: 'GLM (Z.ai)',
    defaultTrigger: 'глм',
    hasApiKeyField: true,
    keyPlaceholder: 'API-ключ Z.ai',
    defaultModel: 'glm-4.7',
  },
  {
    id: 'DeepSeek',
    label: 'DeepSeek',
    defaultTrigger: 'дипсик',
    hasApiKeyField: true,
    keyPlaceholder: 'API-ключ DeepSeek',
    defaultModel: 'deepseek-chat',
  },
  {
    id: 'Gemini',
    label: 'Google Gemini',
    defaultTrigger: 'гемини',
    hasApiKeyField: true,
    keyPlaceholder: 'API-ключ Google AI Studio',
    defaultModel: 'gemini-2.5-flash',
  },
  {
    id: 'Anthropic',
    label: 'Claude (Anthropic)',
    defaultTrigger: 'клод',
    hasApiKeyField: true,
    keyPlaceholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-5',
  },
  {
    id: 'Xai',
    label: 'Grok (xAI)',
    defaultTrigger: 'grok',
    hasApiKeyField: true,
    keyPlaceholder: 'API-ключ xAI',
    defaultModel: 'grok-4',
  },
  {
    id: 'OpenRouter',
    label: 'OpenRouter',
    defaultTrigger: 'опенроутер',
    hasApiKeyField: true,
    keyPlaceholder: 'sk-or-...',
    defaultModel: 'openrouter/auto',
  },
];
