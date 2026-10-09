import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { ConversionSettings, UpdateConversionSettings } from '../model/conversion-settings.types.ts';

export function useUpdateConversionSettings(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<ConversionSettings, Error, UpdateConversionSettings>({
    mutationFn: async (data) => {
      const response = await apiClient.put<ConversionSettings>(`/conversion-settings`, data, {
        params: chatId ? { chatId } : {},
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ConversionSettings>(['conversion-settings', chatId], data);
      // источник рейтов изменился — конвертер и подписки должны перечитать курсы
      void queryClient.invalidateQueries({ queryKey: ['currency-rates'] });
    },
  });
}
