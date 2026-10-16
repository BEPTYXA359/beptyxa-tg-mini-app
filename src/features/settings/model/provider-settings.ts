import { LLM_PROVIDERS_META, type LlmProviderMeta } from './providers.meta';
import type { ChatSettings, LlmProviderPatch } from './settings.schema';

/** Провайдер подключён: у Groq серверный ключ, у остальных — сохранённый ключ из настроек */
export const isProviderConnected = (settings: ChatSettings, id: string): boolean =>
  id === 'Groq' || !!settings.providers?.[id]?.hasApiKey;

/** Все провайдеры, подключённые — сверху (порядок внутри групп сохраняется) */
export const sortedProvidersMeta = (settings: ChatSettings): LlmProviderMeta[] => {
  const connected = LLM_PROVIDERS_META.filter((meta) => isProviderConnected(settings, meta.id));
  const rest = LLM_PROVIDERS_META.filter((meta) => !isProviderConnected(settings, meta.id));
  return [...connected, ...rest];
};

export const buildLlmProvidersPatch = (data: ChatSettings): Record<string, LlmProviderPatch> => {
  const llmProviders: Record<string, LlmProviderPatch> = {};

  for (const meta of LLM_PROVIDERS_META) {
    const entry = data.providers?.[meta.id];
    if (!entry) continue;

    const patch: LlmProviderPatch = {};
    if (meta.hasApiKeyField && entry.apiKey?.trim()) {
      patch.apiKey = entry.apiKey.trim();
    }
    if (meta.hasApiKeyField) {
      patch.model = entry.model?.trim() ?? '';
    }
    patch.alias = entry.alias?.trim() ?? '';
    if ((entry.endpointVariants?.length ?? 0) > 0) {
      patch.endpointVariant = entry.endpointVariant?.trim() ?? '';
    }
    if (entry.supportsWebSearch) {
      patch.webSearch = entry.webSearch ?? false;
    }
    llmProviders[meta.id] = patch;
  }

  return llmProviders;
};
