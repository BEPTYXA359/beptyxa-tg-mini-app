import React from 'react';
import { Cell, Checkbox, Section } from '@telegram-apps/telegram-ui';
import { DAYS_OF_WEEK } from '../model/reminders.types';

interface DaysOfWeekPickerProps {
  selectedDays: number[];
  onToggle: (dayValue: number) => void;
}

export const DaysOfWeekPicker = React.memo<DaysOfWeekPickerProps>(({ selectedDays, onToggle }) => (
  <Section header="Дни недели">
    {DAYS_OF_WEEK.map((day) => {
      const isChecked = selectedDays.includes(day.value);

      return (
        <Cell
          key={day.value}
          Component="label"
          after={<Checkbox checked={isChecked} onChange={() => onToggle(day.value)} />}
        >
          {day.label}
        </Cell>
      );
    })}
  </Section>
));
