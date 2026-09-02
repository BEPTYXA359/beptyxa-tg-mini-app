const pad = (n: number): string => String(n).padStart(2, '0');

/** Проверяет, что строка 'YYYY-MM-DD' — существующая дата (отсекает '2026-13-45') */
export function isRealDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const instant = new Date(Date.UTC(y, m - 1, d));
  return (
    instant.getUTCFullYear() === y && instant.getUTCMonth() === m - 1 && instant.getUTCDate() === d
  );
}

/** 'YYYY-MM-DD' → Date в локальной зоне (без смещения на полосу даты) */
export function parseDateString(dateStr: string): Date | null {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Сколько дней осталось до даты (отрицательно — дата прошла) */
export function daysUntil(dateStr: string, now: Date = new Date()): number | null {
  const target = parseDateString(dateStr);
  if (!target) return null;
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfTarget.getTime() - startOfNow.getTime()) / 86_400_000);
}

export function formatDateRu(dateStr: string): string {
  const target = parseDateString(dateStr);
  if (!target) return dateStr;
  return target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function pluralDays(days: number): string {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}

/** «сегодня» / «завтра» / «через 3 дня» / «через 23 дня» / «2 дня назад» */
export function formatNextPayment(dateStr: string, now: Date = new Date()): string {
  const days = daysUntil(dateStr, now);
  if (days === null) return '';
  if (days === 0) return 'сегодня';
  if (days === 1) return 'завтра';
  if (days > 1) return `через ${days} ${pluralDays(days)}`;
  if (days === -1) return 'вчера';
  return `${-days} ${pluralDays(-days)} назад`;
}

export function todayDateString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
