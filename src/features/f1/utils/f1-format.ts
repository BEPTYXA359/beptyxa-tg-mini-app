import type { F1ResultEntry, F1SessionKind } from '../model/f1.types';

export type F1ResultColumnKey =
  | 'position'
  | 'driver'
  | 'constructor'
  | 'time'
  | 'gap'
  | 'laps'
  | 'points'
  | 'status'
  | 'q1'
  | 'q2'
  | 'q3';

const MSK = 'Europe/Moscow';

export const formatMskDateTime = (value: string): string =>
  new Intl.DateTimeFormat('ru-RU', {
    timeZone: MSK,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));

/** 🇨🇳 по ISO 3166-1 alpha-2; там, где emoji-флагов нет, платформа покажет код страны */
export const countryFlag = (code: string | undefined): string =>
  code
    ? [...code.toUpperCase()]
        .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
        .join('')
    : '';

export const formatPositionDelta = (delta: number | null): string => {
  if (delta === null || delta === 0) return '—';
  return delta > 0 ? `▲ ${delta}` : `▼ ${Math.abs(delta)}`;
};

export const formatPointsDelta = (delta: number | null): string => {
  if (delta === null) return '—';
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return '0';
};

export const getResultColumns = (
  kind: F1SessionKind,
): Array<{ key: F1ResultColumnKey; label: string }> => {
  const base: Array<{ key: F1ResultColumnKey; label: string }> = [
    { key: 'position', label: 'Поз.' },
    { key: 'driver', label: 'Пилот' },
  ];
  if (kind === 'qualifying' || kind === 'sprintQualifying') {
    const prefix = kind === 'qualifying' ? 'Q' : 'SQ';
    return [
      ...base,
      { key: 'q1', label: `${prefix}1` },
      { key: 'q2', label: `${prefix}2` },
      { key: 'q3', label: `${prefix}3` },
    ];
  }
  return [...base, { key: 'time', label: 'Время' }, { key: 'points', label: 'Очки' }];
};

export const formatResultCell = (entry: F1ResultEntry, key: F1ResultColumnKey): string | number => {
  switch (key) {
    case 'position':
      return entry.positionText;
    case 'driver':
      return entry.driverNameRu;
    case 'constructor':
      return entry.constructorNameRu;
    case 'time':
      return entry.time ?? entry.gap ?? (entry.dnf ? 'DNF' : '—');
    case 'gap':
      return entry.gap ?? '—';
    case 'laps':
      return entry.laps ?? '—';
    case 'points':
      return entry.points ?? '—';
    case 'status':
      return entry.status ?? (entry.dnf ? 'DNF' : '—');
    case 'q1':
      return entry.segments?.[0] ?? '—';
    case 'q2':
      return entry.segments?.[1] ?? '—';
    case 'q3':
      return entry.segments?.[2] ?? '—';
  }
};
