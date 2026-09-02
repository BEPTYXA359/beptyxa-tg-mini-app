import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { SubscriptionSettings } from '../model/subscriptions.types';

export function useUpdateSubscriptionSettings(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionSettings, Error, SubscriptionSettings>({
    mutationFn: async (data) => {
      const response = await apiClient.put<SubscriptionSettings>(`/subscriptions/settings`, data, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SubscriptionSettings>(['subscription-settings', chatId], data);
    },
  });
}
