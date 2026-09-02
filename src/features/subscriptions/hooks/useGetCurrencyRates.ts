import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client.ts';
import type { CurrencyRates } from '../model/subscriptions.types';

/** Курсы обновляются на бэке раз в сутки, поэтому кэшируем на час */
export function useGetCurrencyRates(options: { enabled?: boolean } = {}) {
  return useQuery<CurrencyRates, Error>({
    queryKey: ['currency-rates'],
    queryFn: async () => {
      const response = await apiClient.get<CurrencyRates>(`/currency`);
      return response.data;
    },
    staleTime: 60 * 60 * 1000,
    enabled: options.enabled,
  });
}
