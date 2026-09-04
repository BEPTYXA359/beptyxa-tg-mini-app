import { z } from 'zod';

export const MAX_SYSTEM_PROMPT_LENGTH = 4000;

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
  availableModels: z.string().array(),
});

export type ChatSettings = z.infer<typeof ChatSettingsSchema>;

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
}
