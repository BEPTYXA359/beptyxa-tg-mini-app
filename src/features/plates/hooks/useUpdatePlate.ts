import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { CreatePlateInput } from '../model/plates.types';

interface EditVariables {
  id: string;
  data: CreatePlateInput;
}

export function useUpdatePlate(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EditVariables>({
    mutationFn: async ({ id, data }) => {
      await apiClient.put(`/car-plates/${id}`, data, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plates', chatId] });
    },
  });
}
