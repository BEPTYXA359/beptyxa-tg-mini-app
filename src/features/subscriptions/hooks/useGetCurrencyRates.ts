import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { CurrencyRates, RatesSource } from '../model/subscriptions.types';

export function useGetCurrencyRates(options: { enabled?: boolean; source?: RatesSource } = {}) {
  const chatId = getChatId();

  return useQuery<CurrencyRates, Error>({
    queryKey: ['currency-rates', chatId, options.source ?? null],
    queryFn: async () => {
      const response = await apiClient.get<CurrencyRates>(`/currency`, {
        params: {
          ...(chatId ? { chatId } : {}),
          ...(options.source ? { source: options.source } : {}),
        },
      });
      return response.data;
    },
    staleTime: 60 * 60 * 1000,
    enabled: options.enabled,
  });
}
