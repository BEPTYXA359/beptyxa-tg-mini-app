import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type { F1Settings } from '../model/f1.types';

export function useGetF1Settings(chatId?: number) {
  return useQuery<F1Settings, Error>({
    queryKey: ['f1-settings', chatId],
    queryFn: async () => {
      const response = await apiClient.get<F1Settings>(`/f1/settings/${chatId}`);
      return response.data;
    },
    enabled: chatId !== undefined,
  });
}
