import { z } from 'zod';

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 0, label: 'Воскресенье' },
] as const;

export type FrequencyType = 'once' | 'daily' | 'every_other_day' | 'specific_days';

export interface Reminder {
  _id: string;
  chatId: number;
  createdBy: number;
  creatorFirstName: string;
  creatorUsername?: string;
  message: string;
  frequency: FrequencyType;
  time: string;
  specificDays?: number[];
  createdAt: string;
}

export const createReminderSchema = z.object({
  message: z.string().min(1, 'Введите текст напоминания').max(1000),
  frequency: z.enum(['once', 'daily', 'every_other_day', 'specific_days'] as const),
  time: z.string().min(1, 'Выберите время'),
  specificDays: z.array(z.number().min(0).max(6)).optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
