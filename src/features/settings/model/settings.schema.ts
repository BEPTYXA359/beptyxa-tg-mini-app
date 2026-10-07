import { z } from 'zod';

export const MAX_SYSTEM_PROMPT_LENGTH = 4000;
export const MAX_ALIAS_LENGTH = 30;

export const LlmProviderEntrySchema = z.object({
  hasApiKey: z.boolean().default(false),
  apiKey: z.string().optional(),
  model: z.string().optional().nullable(),
  alias: z
    .string()
    .max(MAX_ALIAS_LENGTH, `Не больше ${MAX_ALIAS_LENGTH} символов`)
    .optional()
    .nullable(),
});

export const ChatSettingsSchema = z.object({
  isOpenAiEnabled: z.boolean().default(true),
  isChatterboxEnabled: z.boolean().default(false),
  hasOpenAiApiKey: z.boolean().default(false),
  openAiApiKey: z.string().optional(),
  llmSystemPrompt: z
    .string()
    .max(MAX_SYSTEM_PROMPT_LENGTH, `Не больше ${MAX_SYSTEM_PROMPT_LENGTH} символов`)
    .optional()
    .nullable(),
  chatterboxSystemPrompt: z
    .string()
    .max(MAX_SYSTEM_PROMPT_LENGTH, `Не больше ${MAX_SYSTEM_PROMPT_LENGTH} символов`)
    .optional()
    .nullable(),
  isStreamingEnabled: z.boolean().default(false),
  openAiModel: z.string().default('gpt-4o-mini'),
  chatterboxChance: z.number().min(0).max(1).default(0.02),
  providers: z.record(z.string(), LlmProviderEntrySchema).default({}),
  availableModels: z.string().array().default([]),
  providerModels: z.record(z.string(), z.string().array()).default({}),
});

export type ChatSettings = z.infer<typeof ChatSettingsSchema>;

/** Патч настроек одного провайдера для POST /settings (поле llmProviders) */
export interface LlmProviderPatch {
  apiKey?: string;
  model?: string;
  alias?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
}
