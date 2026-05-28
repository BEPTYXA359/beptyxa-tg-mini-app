import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { ChatSettingsSchema } from '../model/settings.schema';

export const useGetSettings = (chatId?: string) => {
  return useQuery({
    queryKey: ['settings', chatId],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>('/settings', {
        params: chatId ? { chatId } : {},
      });
      return ChatSettingsSchema.parse(data);
    },
  });
};
