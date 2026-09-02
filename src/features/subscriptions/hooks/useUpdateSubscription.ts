import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { SubscriptionPayload } from '../model/subscriptions.types';

interface EditVariables {
  id: string;
  data: SubscriptionPayload;
}

export function useUpdateSubscription(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EditVariables>({
    mutationFn: async ({ id, data }) => {
      await apiClient.put(`/subscriptions/${id}`, data, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscriptions', chatId] });
    },
  });
}
