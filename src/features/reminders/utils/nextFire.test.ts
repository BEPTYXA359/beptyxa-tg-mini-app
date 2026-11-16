import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Reminder } from '../model/reminders.types';
import { getNextFireDate, getNextFireLabel } from './nextFire';

const reminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  _id: 'reminder-1',
  chatId: -100,
  createdBy: 1,
  creatorFirstName: 'User',
  message: 'Test',
  frequency: 'daily',
  time: '09:00',
  timezone: 'UTC',
  createdAt: '2026-03-01T09:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getNextFireDate', () => {
  it('keeps daily wall-clock time after the spring DST transition', () => {
    const result = getNextFireDate(
      reminder({ timezone: 'America/New_York' }),
      new Date('2026-03-08T12:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-08T13:00:00.000Z');
  });

  it('counts every-other-day occurrences by calendar days in the reminder timezone', () => {
    const result = getNextFireDate(
      reminder({
        frequency: 'every_other_day',
        timezone: 'America/New_York',
        createdAt: '2026-03-07T14:00:00.000Z',
      }),
      new Date('2026-03-09T12:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-09T13:00:00.000Z');
  });

  it('checks specific weekdays in the reminder timezone', () => {
    const result = getNextFireDate(
      reminder({ frequency: 'specific_days', specificDays: [1], timezone: 'America/New_York' }),
      new Date('2026-03-08T23:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-09T13:00:00.000Z');
  });

  it('derives legacy recurring clock time from ISO in the reminder timezone', () => {
    const result = getNextFireDate(
      reminder({ time: '2026-01-01T09:30:00.000Z', timezone: 'America/New_York' }),
      new Date('2026-03-08T12:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-09T08:30:00.000Z');
  });

  it('uses UTC for legacy reminders without a timezone', () => {
    const result = getNextFireDate(
      reminder({ timezone: undefined }),
      new Date('2026-03-08T08:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-08T09:00:00.000Z');
  });

  it('recalculates the offset for wall-clock time after a DST transition', () => {
    const result = getNextFireDate(
      reminder({ timezone: 'America/New_York', time: '03:30' }),
      new Date('2026-03-08T00:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-08T07:30:00.000Z');
  });

  it('moves a skipped wall-clock time forward by the DST gap', () => {
    const result = getNextFireDate(
      reminder({ timezone: 'Europe/Berlin', time: '02:30' }),
      new Date('2026-03-29T00:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-03-29T01:30:00.000Z');
  });

  it('uses the earlier instant for a repeated wall-clock time', () => {
    const result = getNextFireDate(
      reminder({ timezone: 'Europe/Berlin', time: '02:30' }),
      new Date('2026-10-25T00:00:00.000Z'),
    );

    expect(result?.toISOString()).toBe('2026-10-25T00:30:00.000Z');
  });
});

describe('getNextFireLabel', () => {
  it('labels the wall-clock time and timezone instead of converting to the device timezone', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T12:00:00.000Z'));

    const label = getNextFireLabel(reminder({ timezone: 'America/New_York' }));

    expect(label).toContain('09:00');
    expect(label).toContain('America/New_York');
  });
});
