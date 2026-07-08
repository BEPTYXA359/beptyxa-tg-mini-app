import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';

export function useDeleteReminders(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (reminderId) => {
      console.log('reminderId', reminderId);
      await apiClient.delete(`/reminders/${reminderId}`, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', chatId] });
    },
  });
}
