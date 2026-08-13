import React, { useMemo } from 'react';
import { Avatar, Banner } from '@vkontakte/vkui';
import { BellRing } from 'lucide-react';
import type { Reminder } from '../model/reminders.types';
import { formatNextFire, getNextFireDate } from '../utils/nextFire';
import { haptic } from '@/shared/utils/haptic.util';

interface RemindersWidgetProps {
  onClick: () => void;
  reminders: Reminder[];
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ onClick, reminders }) => {
  const { count, subtitle } = useMemo(() => {
    const nextDates = reminders
      .map((r) => getNextFireDate(r))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    const soonest = nextDates[0];
    if (reminders.length === 0) {
      return { count: 0, subtitle: 'Нет активных напоминаний' };
    }
    return {
      count: reminders.length,
      subtitle: soonest ? `Ближайшее: ${formatNextFire(soonest)}` : `Активных: ${reminders.length}`,
    };
  }, [reminders]);

  return (
    <Banner
      mode="tint"
      before={
        <Avatar
          size={40}
          style={{ background: 'var(--vkui--color_background_accent)' }}
        >
          <BellRing size={20} color="var(--vkui--color_background_contrast)" />
        </Avatar>
      }
      title={count > 0 ? `Напоминания · ${count}` : 'Напоминания'}
      subtitle={subtitle}
      after="chevron"
      onClick={() => {
        haptic.impact('light');
        onClick();
      }}
    />
  );
};
