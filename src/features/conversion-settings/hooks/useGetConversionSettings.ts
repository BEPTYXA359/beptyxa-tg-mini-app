import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { ConversionSettings } from '../model/conversion-settings.types.ts';

export function useGetConversionSettings(chatId?: number, options: { enabled?: boolean } = {}) {
  return useQuery<ConversionSettings, Error>({
    queryKey: ['conversion-settings', chatId],
    queryFn: async () => {
      const response = await apiClient.get<ConversionSettings>(`/conversion-settings`, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled,
  });
}
