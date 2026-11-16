import { describe, expect, it } from 'vitest';
import { createReminderSchema, type CreateReminderInput } from './reminders.types';

const validInput = (overrides: Partial<CreateReminderInput> = {}): CreateReminderInput => ({
  message: 'Call',
  frequency: 'daily',
  time: '09:00',
  specificDays: undefined,
  timezone: 'Europe/Moscow',
  silent: false,
  ...overrides,
});

describe('createReminderSchema', () => {
  it('rejects specific-days reminders without selected days', () => {
    expect(
      createReminderSchema.safeParse(validInput({ frequency: 'specific_days', specificDays: [] }))
        .success,
    ).toBe(false);
    expect(
      createReminderSchema.safeParse(
        validInput({ frequency: 'specific_days', specificDays: undefined }),
      ).success,
    ).toBe(false);
  });

  it('accepts specific-days reminders with at least one selected day', () => {
    expect(
      createReminderSchema.safeParse(
        validInput({ frequency: 'specific_days', specificDays: [1, 5] }),
      ).success,
    ).toBe(true);
  });

  it('rejects invalid and past one-time reminders', () => {
    expect(
      createReminderSchema.safeParse(validInput({ frequency: 'once', time: 'not-a-date' })).success,
    ).toBe(false);
    expect(
      createReminderSchema.safeParse(
        validInput({ frequency: 'once', time: '2020-01-01T00:00:00.000Z' }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid recurring clock values', () => {
    expect(createReminderSchema.safeParse(validInput({ time: '24:00' })).success).toBe(false);
    expect(createReminderSchema.safeParse(validInput({ time: '09:60' })).success).toBe(false);
  });

  it('rejects invalid IANA timezones', () => {
    expect(createReminderSchema.safeParse(validInput({ timezone: 'Mars/Olympus' })).success).toBe(
      false,
    );
  });

  it('accepts a future one-time reminder', () => {
    expect(
      createReminderSchema.safeParse(
        validInput({
          frequency: 'once',
          time: new Date(Date.now() + 60_000).toISOString(),
        }),
      ).success,
    ).toBe(true);
  });
});
