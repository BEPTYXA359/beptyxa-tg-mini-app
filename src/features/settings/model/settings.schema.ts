import { z } from 'zod';

export const MAX_SYSTEM_PROMPT_LENGTH = 4000;
export const MAX_ALIAS_LENGTH = 30;
export const MAX_CHATTERBOX_TRIGGER_LENGTH = 30;

export const LlmProviderEntrySchema = z.object({
  hasApiKey: z.boolean().default(false),
  apiKey: z.string().optional(),
  model: z.string().optional().nullable(),
  alias: z
    .string()
    .max(MAX_ALIAS_LENGTH, `Не больше ${MAX_ALIAS_LENGTH} символов`)
    .optional()
    .nullable(),
  endpointVariant: z.string().optional().nullable(),
  endpointVariants: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
  supportsWebSearch: z.boolean().default(false),
  webSearch: z.boolean().default(false),
});

export type LlmProviderEntry = z.infer<typeof LlmProviderEntrySchema>;

export const ChatSettingsSchema = z.object({
  isChatterboxEnabled: z.boolean().default(false),
  isStreamingEnabled: z.boolean().default(false),
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
  chatterboxChance: z.number().min(0).max(1).default(0.02),
  chatterboxTrigger: z
    .string()
    .max(MAX_CHATTERBOX_TRIGGER_LENGTH, `Не больше ${MAX_CHATTERBOX_TRIGGER_LENGTH} символов`)
    .refine(
      (value) => value.trim().length === 0 || !/\s/.test(value.trim()),
      'Триггер Балабола должен быть одним словом',
    )
    .optional()
    .nullable(),
  chatterboxProvider: z.string().optional().nullable(),
  providers: z.record(z.string(), LlmProviderEntrySchema).default({}),
  providerModels: z.record(z.string(), z.string().array()).default({}),
});

export type ChatSettings = z.infer<typeof ChatSettingsSchema>;

/** Патч настроек одного провайдера для POST /settings (поле llmProviders) */
export interface LlmProviderPatch {
  apiKey?: string;
  model?: string;
  alias?: string;
  endpointVariant?: string;
  webSearch?: boolean;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
}
