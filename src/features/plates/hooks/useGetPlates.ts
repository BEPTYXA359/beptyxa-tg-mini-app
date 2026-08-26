import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { Plate } from '../model/plates.types';

export function useGetPlates(chatId?: number) {
  return useQuery<Plate[], Error>({
    queryKey: ['plates', chatId],
    queryFn: async () => {
      const response = await apiClient.get<Plate[]>(`/car-plates`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
  });
}
