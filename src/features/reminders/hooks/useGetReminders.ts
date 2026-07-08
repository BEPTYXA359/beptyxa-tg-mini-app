import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { Reminder } from '../model/reminders.types';

export function useGetReminders(chatId?: number) {
  return useQuery<Reminder[], Error>({
    queryKey: ['reminders', chatId],
    queryFn: async () => {
      const response = await apiClient.get<Reminder[]>(`/reminders`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
  });
}
