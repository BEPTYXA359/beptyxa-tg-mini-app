import React from 'react';
import type { Reminder } from '@/features/reminders/model/reminders.types.ts';
import { Cell, IconButton, List, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { Trash } from 'lucide-react';

interface RemindersListProps {
  items: Reminder[];
  onDelete: (id: string) => void;
  onEdit: (item: Reminder) => void;
}

const DAYS_MAP: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  0: 'Вс',
};

const formatFrequency = (item: Reminder): string => {
  switch (item.frequency) {
    case 'once':
      return `${new Date(item.time).toLocaleDateString()} в ${new Date(item.time).toLocaleTimeString()}`;
    case 'daily':
      return `Каждый день в ${item.time}`;
    case 'every_other_day':
      return `Через день в ${item.time}`;
    case 'specific_days':
      return `Дни: ${item.specificDays
        ?.sort()
        .map((day) => DAYS_MAP[day] ?? '')
        .join(', ')} в ${item.time}`;
    default:
      return '';
  }
};

export const RemindersList: React.FC<RemindersListProps> = ({ items, onDelete, onEdit }) => {
  if (items.length === 0) {
    return <Placeholder description="В этом чате пока нет запущенных напоминаний" />;
  }

  const onDeleteClick = (id: string) => {
    onDelete(id);
  };

  const onEditClick = (item: Reminder) => {
    onEdit(item);
  };

  return (
    <List>
      <Section header="Активные напоминания">
        {items.map((item) => (
          <Cell
            Component="label"
            key={item._id}
            data-id={item._id}
            title={item.message}
            subtitle={formatFrequency(item)}
            description={`Автор: ${item.creatorFirstName} ${item.creatorUsername ? `(@${item.creatorUsername})` : ''}`}
            after={
              <IconButton
                mode="bezeled"
                size="s"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--tg-theme-destructive-text-color) 10%,transparent)',
                  color: 'var(--tg-theme-destructive-text-color)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(item._id);
                }}
              >
                <Trash />
              </IconButton>
            }
            multiline
            onClick={() => onEditClick(item)}
          >
            {item.message}
          </Cell>
        ))}
      </Section>
    </List>
  );
};
