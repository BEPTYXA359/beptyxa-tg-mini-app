import { describe, expect, it } from 'vitest';
import {
  countryFlag,
  formatMskDateTime,
  formatPointsDelta,
  formatPositionDelta,
  formatResultCell,
  getResultColumns,
} from './f1-format';
import type { F1ResultEntry } from '../model/f1.types';

const entry: F1ResultEntry = {
  position: null,
  positionText: 'R',
  driverName: 'Fernando Alonso',
  driverNameRu: 'Фернандо Алонсо',
  constructorName: 'Aston Martin',
  constructorNameRu: 'Астон Мартин',
  status: 'Retired',
  dnf: true,
};

describe('форматирование Ф1', () => {
  it('показывает дату и время в Europe/Moscow', () => {
    expect(formatMskDateTime('2026-11-01T20:00:00.000Z')).toBe('01.11.2026, 23:00');
  });

  it('строит флаг страны по ISO-коду, без кода — пустую строку', () => {
    expect(countryFlag('CN')).toBe('🇨🇳');
    expect(countryFlag('gb')).toBe('🇬🇧');
    expect(countryFlag(undefined)).toBe('');
  });

  it('форматирует дельту позиций и очков', () => {
    expect(formatPositionDelta(2)).toBe('▲ 2');
    expect(formatPositionDelta(-1)).toBe('▼ 1');
    expect(formatPositionDelta(null)).toBe('—');
    expect(formatPointsDelta(25)).toBe('+25');
    expect(formatPointsDelta(-5)).toBe('−5');
  });

  it('выбирает сегменты для квалификации и статус для DNF', () => {
    expect(getResultColumns('qualifying').map((column) => column.key)).toEqual([
      'position',
      'driver',
      'q1',
      'q2',
      'q3',
    ]);
    expect(getResultColumns('race').map((column) => column.key)).toEqual([
      'position',
      'driver',
      'time',
      'points',
    ]);
    expect(formatResultCell(entry, 'position')).toBe('R');
    expect(formatResultCell(entry, 'status')).toBe('Retired');
    expect(formatResultCell(entry, 'time')).toBe('DNF');
  });
});
