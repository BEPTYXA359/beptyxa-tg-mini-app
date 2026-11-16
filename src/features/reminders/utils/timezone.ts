export interface TzDateParts {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timezone: string): Intl.DateTimeFormat => {
  const cached = formatterCache.get(timezone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  formatterCache.set(timezone, formatter);
  return formatter;
};

export const isValidTimezone = (timezone: string): boolean => {
  try {
    getFormatter(timezone);
    return true;
  } catch {
    return false;
  }
};

export const getTzParts = (instant: Date, timezone: string): TzDateParts => {
  const collected: Record<string, number> = {};
  for (const part of getFormatter(timezone).formatToParts(instant)) {
    if (part.type !== 'literal') collected[part.type] = Number(part.value);
  }
  return {
    y: collected.year,
    m: collected.month,
    d: collected.day,
    h: collected.hour % 24,
    mi: collected.minute,
    s: collected.second,
  };
};

export const getTzOffsetMs = (instant: Date, timezone: string): number => {
  const parts = getTzParts(instant, timezone);
  const wallAsUtc = Date.UTC(parts.y, parts.m - 1, parts.d, parts.h, parts.mi, parts.s);
  return wallAsUtc - instant.getTime();
};

export const wallClockInstant = (
  day: number,
  month: number,
  year: number,
  hours: number,
  minutes: number,
  timezone: string,
): Date => {
  const wallAsUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offsetBefore = getTzOffsetMs(new Date(wallAsUtc - 86_400_000), timezone);
  const offsetAfter = getTzOffsetMs(new Date(wallAsUtc + 86_400_000), timezone);
  const offsetAtGuess = getTzOffsetMs(new Date(wallAsUtc), timezone);
  const candidates = [...new Set([offsetBefore, offsetAfter, offsetAtGuess])]
    .map((offsetMs) => wallAsUtc - offsetMs)
    .filter((candidateMs) => {
      const parts = getTzParts(new Date(candidateMs), timezone);
      return (
        parts.y === year &&
        parts.m === month &&
        parts.d === day &&
        parts.h === hours &&
        parts.mi === minutes &&
        parts.s === 0
      );
    });

  if (candidates.length > 0) return new Date(Math.min(...candidates));

  return new Date(wallAsUtc - Math.min(offsetBefore, offsetAfter));
};

export const localDayNumber = (instant: Date, timezone: string): number => {
  const parts = getTzParts(instant, timezone);
  return Math.floor(Date.UTC(parts.y, parts.m - 1, parts.d) / 86_400_000);
};
