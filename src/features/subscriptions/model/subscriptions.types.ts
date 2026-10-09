import { z } from 'zod';
import { isRealDateString } from '../utils/nextPayment';

export const DEFAULT_BASE_CURRENCY = 'RUB';

export type SubscriptionPeriod = 'week' | 'month' | 'quarter' | 'half_year' | 'year';

export type SubscriptionStatus = 'active' | 'paused';

export interface Subscription {
  _id: string;
  chatId: number;
  name: string;
  service?: string;
  cost: number;
  currency: string;
  period: SubscriptionPeriod;
  nextPaymentDate: string;
  remindDaysBefore: number;
  notificationsEnabled: boolean;
  status: SubscriptionStatus;
  color?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: number;
  creatorFirstName: string;
  creatorUsername?: string;
}

export interface SubscriptionSettings {
  baseCurrency: string;
}

export type RatesSource = 'openexchangerates' | 'cbrf' | 'tbank' | 'steam';

export interface TableRates {
  source: RatesSource;
  base: string;
  rates: Record<string, number>;
}

export interface TbankRates {
  source: 'tbank';
  base: 'RUB';
  pairs: Record<string, { buy: number; sell: number }>;
}

export type CurrencyRates = TableRates | TbankRates;

/** Тело POST/PUT — optionals поднимаются из пустых строк формы */
export interface SubscriptionPayload {
  name: string;
  service?: string;
  cost: number;
  currency: string;
  period: SubscriptionPeriod;
  nextPaymentDate: string;
  remindDaysBefore: number;
  notificationsEnabled: boolean;
  status: SubscriptionStatus;
  color?: string;
}

export const SUBSCRIPTION_PERIOD_OPTIONS: Array<{ label: string; value: SubscriptionPeriod }> = [
  { label: 'Раз в неделю', value: 'week' },
  { label: 'Раз в месяц', value: 'month' },
  { label: 'Раз в 3 месяца', value: 'quarter' },
  { label: 'Раз в полгода', value: 'half_year' },
  { label: 'Раз в год', value: 'year' },
];

/** «раз в месяц» — для подзаголовка карточки подписки */
export const PERIOD_LABELS: Record<SubscriptionPeriod, string> = Object.fromEntries(
  SUBSCRIPTION_PERIOD_OPTIONS.map((option) => [option.value, option.label.toLowerCase()]),
) as Record<SubscriptionPeriod, string>;

export const SUBSCRIPTION_REMIND_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'За день', value: '1' },
  { label: 'За 3 дня', value: '3' },
  { label: 'За неделю', value: '7' },
];

export const CURRENCY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '₽ RUB', value: 'RUB' },
  { label: '$ USD', value: 'USD' },
  { label: '€ EUR', value: 'EUR' },
  { label: '£ GBP', value: 'GBP' },
  { label: '₸ KZT', value: 'KZT' },
  { label: '₴ UAH', value: 'UAH' },
  { label: '₺ TRY', value: 'TRY' },
  { label: '֏ AMD', value: 'AMD' },
  { label: '₾ GEL', value: 'GEL' },
  { label: 'Br BYN', value: 'BYN' },
  { label: '¥ CNY', value: 'CNY' },
  { label: 'AED', value: 'AED' },
];

export const subscriptionFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите название').max(100, 'Максимум 100 символов'),
  service: z.string().trim().max(100, 'Максимум 100 символов'),
  cost: z
    .string()
    .trim()
    .min(1, 'Введите стоимость')
    .refine((raw) => parseCost(raw) > 0, 'Стоимость должна быть больше нуля')
    .refine((raw) => parseCost(raw) <= 10_000_000, 'Слишком большая стоимость'),
  currency: z.string().length(3, 'Выберите валюту'),
  period: z.enum(['week', 'month', 'quarter', 'half_year', 'year'], {
    message: 'Выберите период',
  }),
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Выберите дату списания')
    .refine(isRealDateString, 'Такой даты не существует'),
  remindDaysBefore: z.union([z.literal('1'), z.literal('3'), z.literal('7')]),
  notificationsEnabled: z.boolean(),
  paused: z.boolean(),
  color: z.string(),
});

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

/** Стоимость из input: поддерживаем запятую как десятичный разделитель */
export function parseCost(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
