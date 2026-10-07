import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type {
  ChatSettings,
  LlmProviderPatch,
  UpdateSettingsResponse,
} from '../model/settings.schema';

export interface UpdateSettingsPayload extends Partial<Omit<ChatSettings, 'providers'>> {
  llmProviders?: Record<string, LlmProviderPatch>;
}

export const useUpdateSettings = (chatId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: UpdateSettingsPayload) => {
      const { data } = await apiClient.post<UpdateSettingsResponse>('/settings', newSettings, {
        params: chatId ? { chatId } : {},
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
