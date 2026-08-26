import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { CreatePlateInput } from '../model/plates.types';

export function useCreatePlate(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreatePlateInput>({
    mutationFn: async (data) => {
      await apiClient.post(`/car-plates`, data, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plates', chatId] });
    },
  });
}
