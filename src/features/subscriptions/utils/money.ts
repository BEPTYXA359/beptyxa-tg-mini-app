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

export type ConversionMode = 'exchange' | 'price';

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: CurrencyRates,
  mode: ConversionMode = 'exchange',
): number | null {
  if (from === to) return amount;

  if ('pairs' in rates) {
    const pairFrom = rates.pairs[from];
    const pairTo = rates.pairs[to];
    if (from === 'RUB') {
      if (!pairTo) return null;
      return mode === 'price' ? amount / pairTo.buy : amount / pairTo.sell;
    }
    if (to === 'RUB') {
      if (!pairFrom) return null;
      return mode === 'price' ? amount * pairFrom.sell : amount * pairFrom.buy;
    }
    if (!pairFrom || !pairTo) return null;
    return mode === 'price'
      ? (amount * pairFrom.sell) / pairTo.buy
      : (amount * pairFrom.buy) / pairTo.sell;
  }

  const rateFrom = from === rates.base ? 1 : rates.rates[from];
  const rateTo = to === rates.base ? 1 : rates.rates[to];
  if (!rateFrom || !rateTo) return null;
  return (amount / rateFrom) * rateTo;
}

export function hasRates(rates: CurrencyRates | undefined): rates is CurrencyRates {
  if (!rates) return false;
  return 'pairs' in rates
    ? Object.keys(rates.pairs).length > 0
    : Object.keys(rates.rates).length > 0;
}

/** Валюты, доступные в источнике (для селекторов конвертера) */
export function getRateCurrencies(rates: CurrencyRates): string[] {
  const codes = 'pairs' in rates ? Object.keys(rates.pairs) : Object.keys(rates.rates);
  // база может отсутствовать в списке (USD у таблиц, RUB у пар Т-Банка)
  if (!codes.includes(rates.base)) codes.push(rates.base);
  return codes.sort();
}
