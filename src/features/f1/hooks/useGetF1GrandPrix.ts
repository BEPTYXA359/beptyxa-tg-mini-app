import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type { F1GrandPrix } from '../model/f1.types';

export function useGetF1GrandPrix(round: number | null, chatId?: number) {
  return useQuery<F1GrandPrix, Error>({
    queryKey: ['f1-gp', round, chatId],
    queryFn: async () => {
      const response = await apiClient.get<F1GrandPrix>(`/f1/gp/${round}`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    enabled: round !== null,
    staleTime: 60_000,
  });
}
