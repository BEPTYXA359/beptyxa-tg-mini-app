import type { Subscription, SubscriptionPeriod } from '../model/subscriptions.types';
import { convertAmount } from './money';

/** Сколько стоит период подписки в пересчёте на месяц */
const MONTHLY_FACTOR: Record<SubscriptionPeriod, number> = {
  week: 52 / 12,
  month: 1,
  quarter: 1 / 3,
  half_year: 1 / 6,
  year: 1 / 12,
};

export function monthlyCost(subscription: Subscription): number {
  return subscription.cost * MONTHLY_FACTOR[subscription.period];
}

export function yearlyCost(subscription: Subscription): number {
  return monthlyCost(subscription) * 12;
}

/**
 * Суммарный расход в месяц/год в валюте baseCurrency.
 * Возвращает null, если хотя бы одну цену не удалось конвертировать (нет курсов).
 */
export function totalCosts(
  subscriptions: Subscription[],
  baseCurrency: string,
  rates: Record<string, number>,
): { monthly: number; yearly: number } | null {
  let monthly = 0;
  for (const subscription of subscriptions) {
    const converted = convertAmount(
      monthlyCost(subscription),
      subscription.currency,
      baseCurrency,
      rates,
    );
    if (converted === null) return null;
    monthly += converted;
  }
  return { monthly, yearly: monthly * 12 };
}
