import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { SubscriptionSettings } from '../model/subscriptions.types';

export function useGetSubscriptionSettings(chatId?: number, options: { enabled?: boolean } = {}) {
  return useQuery<SubscriptionSettings, Error>({
    queryKey: ['subscription-settings', chatId],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionSettings>(`/subscriptions/settings`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled,
  });
}
