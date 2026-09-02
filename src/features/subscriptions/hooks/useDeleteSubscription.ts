import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';

export function useDeleteSubscription(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (subscriptionId) => {
      await apiClient.delete(`/subscriptions/${subscriptionId}`, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscriptions', chatId] });
    },
  });
}
