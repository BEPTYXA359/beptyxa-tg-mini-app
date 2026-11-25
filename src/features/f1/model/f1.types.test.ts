import { describe, expect, it } from 'vitest';
import { DEFAULT_F1_SETTINGS, f1SettingsSchema, updateF1SettingsSchema } from './f1.types';

describe('модель настроек Ф1', () => {
  it('имеет выключенные подписку, практики и напоминания по умолчанию', () => {
    expect(f1SettingsSchema.parse({})).toEqual(DEFAULT_F1_SETTINGS);
  });

  it('не подставляет дефолты в partial update', () => {
    expect(updateF1SettingsSchema.parse({ fullProtocols: true })).toEqual({ fullProtocols: true });
  });

  it('сортирует интервалы и отклоняет дубли', () => {
    expect(updateF1SettingsSchema.parse({ reminders: [120, 5, 30] })).toEqual({
      reminders: [5, 30, 120],
    });
    expect(updateF1SettingsSchema.safeParse({ reminders: [5, 5] }).success).toBe(false);
  });
});
