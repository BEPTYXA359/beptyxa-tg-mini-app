import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { Subscription, SubscriptionPayload } from '../model/subscriptions.types';

export function useCreateSubscription(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, SubscriptionPayload>({
    mutationFn: async (data) => {
      const response = await apiClient.post<Subscription>(`/subscriptions`, data, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscriptions', chatId] });
    },
  });
}
