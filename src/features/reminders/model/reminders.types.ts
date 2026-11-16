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

export type ReminderKind = 'regular' | 'steam_release';

export interface SteamSubscriber {
  id: number;
  firstName: string;
  username?: string;
}

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
  timezone?: string;
  silent?: boolean;
  kind?: ReminderKind;
  steamAppId?: string;
  gameName?: string;
  subscribers?: SteamSubscriber[];
  createdAt: string;
}

export const createReminderSchema = z
  .object({
    message: z.string().min(1, 'Введите текст напоминания').max(1000),
    frequency: z.enum(['once', 'daily', 'every_other_day', 'specific_days'] as const),
    time: z.string().min(1, 'Выберите время'),
    specificDays: z.array(z.number().int().min(0).max(6)).optional(),
    timezone: z
      .string()
      .refine((timezone) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: timezone });
          return true;
        } catch {
          return false;
        }
      }, 'Неверный часовой пояс')
      .optional(),
    silent: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.frequency === 'specific_days' && !data.specificDays?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Выберите хотя бы один день недели',
        path: ['specificDays'],
      });
    }

    if (data.frequency === 'once') {
      const runAt = new Date(data.time);
      if (Number.isNaN(runAt.getTime())) {
        ctx.addIssue({
          code: 'custom',
          message: 'Введите корректные дату и время',
          path: ['time'],
        });
      } else if (runAt.getTime() <= Date.now()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Дата и время должны быть в будущем',
          path: ['time'],
        });
      }
    } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(data.time)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Введите время в формате ЧЧ:ММ',
        path: ['time'],
      });
    }
  });

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
