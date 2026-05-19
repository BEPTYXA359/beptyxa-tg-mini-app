import { z } from 'zod';

export const ChatSettingsSchema = z.object({
  isOpenAiEnabled: z.boolean().default(true),
  isChatterboxEnabled: z.boolean().default(false),
  hasOpenAiApiKey: z.boolean().default(false),
  openAiApiKey: z.string().optional(),
  llmSystemPrompt: z.string().optional().nullable(),
  chatterboxSystemPrompt: z.string().optional().nullable(),
  openAiModel: z.string().default('gpt-4o-mini'),
  chatterboxChance: z.number().min(0).max(1).default(0.02),
});

export type ChatSettings = z.infer<typeof ChatSettingsSchema>;

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
}
