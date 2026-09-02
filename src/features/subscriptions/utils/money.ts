import type { CurrencyRates } from '../model/subscriptions.types';

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Формат для итогов и приблизительных цен — без копеек */
export function formatMoneyShort(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  const rateFrom = rates[from];
  const rateTo = rates[to];
  if (!rateFrom || !rateTo) return null;
  return (amount / rateFrom) * rateTo;
}

export function hasRates(rates: CurrencyRates | undefined): rates is CurrencyRates {
  return !!rates && Object.keys(rates.rates).length > 0;
}
