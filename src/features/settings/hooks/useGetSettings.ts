import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { ChatSettingsSchema } from '../model/settings.schema';

export const useGetSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>('/settings');
      return ChatSettingsSchema.parse(data);
    },
  });
};
