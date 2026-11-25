import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import type { F1Settings, UpdateF1Settings } from '../model/f1.types';

export function useUpdateF1Settings(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<F1Settings, Error, UpdateF1Settings>({
    mutationFn: async (data) => {
      const response = await apiClient.put<F1Settings>(`/f1/settings/${chatId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<F1Settings>(['f1-settings', chatId], data);
    },
  });
}
