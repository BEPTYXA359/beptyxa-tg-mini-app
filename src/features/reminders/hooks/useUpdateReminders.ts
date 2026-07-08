import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { CreateReminderInput } from '../model/reminders.types';

interface EditVariables {
  id: string;
  data: CreateReminderInput;
}

export function useUpdateReminders(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EditVariables>({
    mutationFn: async ({ id, data }) => {
      await apiClient.put(`/reminders/${id}`, data, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', chatId] });
    },
  });
}
