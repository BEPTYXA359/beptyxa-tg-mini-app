import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { LlmUsageSummary } from '../model/llm-usage.types.ts';

export function useGetLlmUsage(chatId?: number) {
  return useQuery<LlmUsageSummary, Error>({
    queryKey: ['llm-usage', chatId],
    queryFn: async () => {
      const response = await apiClient.get<LlmUsageSummary>(`/llm-usage`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
  });
}
