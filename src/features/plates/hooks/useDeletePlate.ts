import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';

export function useDeletePlate(chatId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (plateId) => {
      await apiClient.delete(`/car-plates/${plateId}`, {
        params: chatId ? { chatId } : {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plates', chatId] });
    },
  });
}
