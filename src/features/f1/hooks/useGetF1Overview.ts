import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type { F1Overview } from '../model/f1.types';

export function useGetF1Overview(chatId?: number) {
  return useQuery<F1Overview, Error>({
    queryKey: ['f1-overview', chatId],
    queryFn: async () => {
      const response = await apiClient.get<F1Overview>('/f1/overview', {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    staleTime: 60_000,
  });
}
