import React from 'react';
import { Button, Group, Header } from '@vkontakte/vkui';
import { DAYS_OF_WEEK } from '../model/reminders.types';
import { haptic } from '@/shared/utils/haptic.util';

interface DaysOfWeekPickerProps {
  selectedDays: number[];
  onToggle: (dayValue: number) => void;
}

const DAYS_SHORT: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  0: 'Вс',
};

export const DaysOfWeekPicker = React.memo<DaysOfWeekPickerProps>(
  ({ selectedDays, onToggle }) => (
    <Group mode="card" header={<Header>Дни недели</Header>} padding="s">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DAYS_OF_WEEK.map((day) => {
          const isChecked = selectedDays.includes(day.value);
          return (
            <Button
              key={day.value}
              size="s"
              mode={isChecked ? 'primary' : 'outline'}
              appearance="accent"
              aria-pressed={isChecked}
              aria-label={day.label}
              style={{ flex: '1 1 auto', minWidth: 40 }}
              onClick={() => {
                haptic.selection();
                onToggle(day.value);
              }}
            >
              {DAYS_SHORT[day.value]}
            </Button>
          );
        })}
      </div>
    </Group>
  ),
);
