import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { CreateReminderInput } from '../model/reminders.types';

export function useCreateReminders(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateReminderInput>({
    mutationFn: async (data) => {
      await apiClient.post(`/reminders`, data, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', chatId] });
    },
  });
}
