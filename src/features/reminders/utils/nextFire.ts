import type { Reminder } from '../model/reminders.types';
import { getTzParts, isValidTimezone, localDayNumber, wallClockInstant } from './timezone';

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_MS = 86_400_000;
const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const pad = (n: number): string => String(n).padStart(2, '0');

type ReminderSchedule = Pick<
  Reminder,
  'frequency' | 'time' | 'specificDays' | 'createdAt' | 'timezone'
>;

const resolveClockMinutes = (time: string, timezone: string): number | null => {
  const clock = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (clock) {
    const hours = Number(clock[1]);
    const minutes = Number(clock[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
  }

  const instant = new Date(time);
  if (Number.isNaN(instant.getTime())) return null;
  const parts = getTzParts(instant, timezone);
  return parts.h * 60 + parts.mi;
};

const instantForDay = (dayNumber: number, clockMinutes: number, timezone: string): Date => {
  const calendarDay = new Date(dayNumber * DAY_MS);
  return wallClockInstant(
    calendarDay.getUTCDate(),
    calendarDay.getUTCMonth() + 1,
    calendarDay.getUTCFullYear(),
    Math.floor(clockMinutes / 60),
    clockMinutes % 60,
    timezone,
  );
};

export function getNextFireDate(reminder: ReminderSchedule, now: Date = new Date()): Date | null {
  const { frequency, time, specificDays, createdAt } = reminder;

  if (frequency === 'once') {
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const timezone = reminder.timezone ?? 'UTC';
  if (!isValidTimezone(timezone)) return null;
  const clockMinutes = resolveClockMinutes(time, timezone);
  if (clockMinutes === null) return null;
  const todayNumber = localDayNumber(now, timezone);

  switch (frequency) {
    case 'daily': {
      for (let offset = 0; offset <= 1; offset += 1) {
        const candidate = instantForDay(todayNumber + offset, clockMinutes, timezone);
        if (candidate > now) return candidate;
      }
      return null;
    }

    case 'every_other_day': {
      const created = new Date(createdAt);
      if (Number.isNaN(created.getTime())) return null;
      const anchorDay = localDayNumber(created, timezone);
      let candidateDay = Math.max(todayNumber, anchorDay);
      if ((candidateDay - anchorDay) % 2 !== 0) candidateDay += 1;

      let candidate = instantForDay(candidateDay, clockMinutes, timezone);
      if (candidate <= now) {
        candidate = instantForDay(candidateDay + 2, clockMinutes, timezone);
      }
      return candidate;
    }

    case 'specific_days': {
      const days = specificDays ?? [];
      if (days.length === 0) return null;
      for (let offset = 0; offset < 8; offset += 1) {
        const candidateDay = todayNumber + offset;
        const weekday = new Date(candidateDay * DAY_MS).getUTCDay();
        if (!days.includes(weekday)) continue;
        const candidate = instantForDay(candidateDay, clockMinutes, timezone);
        if (candidate > now) return candidate;
      }
      return null;
    }

    default:
      return null;
  }
}

export function formatNextFire(
  date: Date,
  now: Date = new Date(),
  timezone: string = deviceTimezone,
): string {
  const parts = getTzParts(date, timezone);
  const time = `${pad(parts.h)}:${pad(parts.mi)}`;
  const dayDiff = localDayNumber(date, timezone) - localDayNumber(now, timezone);
  const zoneSuffix = timezone === deviceTimezone ? '' : ` · ${timezone}`;

  if (dayDiff === 0) return `сегодня в ${time}${zoneSuffix}`;
  if (dayDiff === 1) return `завтра в ${time}${zoneSuffix}`;
  if (dayDiff > 0 && dayDiff < 7) {
    const weekday = new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay();
    return `${WEEKDAY_SHORT[weekday]} в ${time}${zoneSuffix}`;
  }
  return `${date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
  })} в ${time}${zoneSuffix}`;
}

export const getNextFireLabel = (reminder: ReminderSchedule): string | null => {
  const date = getNextFireDate(reminder);
  if (!date) return null;
  return formatNextFire(date, new Date(), reminder.timezone ?? deviceTimezone);
};
