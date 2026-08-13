import type { Reminder } from '../model/reminders.types';

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const pad = (n: number): string => String(n).padStart(2, '0');

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const parseHhMm = (hhmm: string): [number, number] => {
  const [h, m] = hhmm.split(':').map(Number);
  return [h ?? 0, m ?? 0];
};

const atTime = (base: Date, hhmm: string): Date => {
  const [h, m] = parseHhMm(hhmm);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
};

/**
 * Вычисляет дату следующего срабатывания напоминания в текущем часовом поясе.
 */
export function getNextFireDate(
  reminder: Pick<Reminder, 'frequency' | 'time' | 'specificDays' | 'createdAt'>,
  now: Date = new Date(),
): Date | null {
  const { frequency, time, specificDays, createdAt } = reminder;

  switch (frequency) {
    case 'once': {
      const d = new Date(time);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    case 'daily': {
      const today = atTime(now, time);
      if (today > now) return today;
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    case 'every_other_day': {
      const created = createdAt ? new Date(createdAt) : now;
      if (Number.isNaN(created.getTime())) return null;
      const daysDiff = Math.round(
        (startOfDay(now).getTime() - startOfDay(created).getTime()) / 86_400_000,
      );
      const isFireDay = ((daysDiff % 2) + 2) % 2 === 0;
      const today = atTime(now, time);

      if (isFireDay) {
        if (today > now) return today;
        const next = new Date(today);
        next.setDate(next.getDate() + 2);
        return next;
      }
      const next = new Date(today);
      next.setDate(next.getDate() + 1);
      return next;
    }

    case 'specific_days': {
      const days = specificDays ?? [];
      if (days.length === 0) return null;
      for (let i = 0; i < 8; i += 1) {
        const candidate = new Date(now);
        candidate.setDate(candidate.getDate() + i);
        const at = atTime(candidate, time);
        if (at <= now) continue;
        if (days.includes(at.getDay())) return at;
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Человекочитаемая относительная подпись: «сегодня в 18:00», «завтра в 09:00», «Пн в 09:00».
 */
export function formatNextFire(date: Date, now: Date = new Date()): string {
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const dayDiff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );

  if (dayDiff === 0) return `сегодня в ${time}`;
  if (dayDiff === 1) return `завтра в ${time}`;
  if (dayDiff > 0 && dayDiff < 7) return `${WEEKDAY_SHORT[date.getDay()]} в ${time}`;
  return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} в ${time}`;
}

export const getNextFireLabel = (
  reminder: Pick<Reminder, 'frequency' | 'time' | 'specificDays' | 'createdAt'>,
): string | null => {
  const date = getNextFireDate(reminder);
  if (!date) return null;
  return formatNextFire(date);
};
