import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { Subscription } from '../model/subscriptions.types';

export function useGetSubscriptions(chatId?: number) {
  return useQuery<Subscription[], Error>({
    queryKey: ['subscriptions', chatId],
    queryFn: async () => {
      const response = await apiClient.get<Subscription[]>(`/subscriptions`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
  });
}
