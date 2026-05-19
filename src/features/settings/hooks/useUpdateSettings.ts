import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type { ChatSettings, UpdateSettingsResponse } from '../model/settings.schema';

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: Partial<ChatSettings>) => {
      const { data } = await apiClient.post<UpdateSettingsResponse>('/settings', newSettings);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
