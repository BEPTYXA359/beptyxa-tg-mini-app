import React, { useMemo } from 'react';
import { Group, Header, IconButton, Placeholder, SimpleCell, Button } from '@vkontakte/vkui';
import { Trash } from 'lucide-react';
import type { Reminder } from '@/features/reminders/model/reminders.types.ts';
import { getNextFireDate, getNextFireLabel } from '../utils/nextFire';

interface RemindersListProps {
  items: Reminder[];
  onDelete: (id: string) => void;
  onEdit: (item: Reminder) => void;
  onCreate: () => void;
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
      return `${new Date(item.time).toLocaleDateString()} в ${new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    case 'daily':
      return `Каждый день в ${item.time}`;
    case 'every_other_day':
      return `Через день в ${item.time}`;
    case 'specific_days':
      return `${item.specificDays
        ?.slice()
        .sort()
        .map((day) => DAYS_MAP[day] ?? '')
        .join(', ')} в ${item.time}`;
    default:
      return '';
  }
};

const formatAuthor = (item: Reminder): string =>
  `${item.creatorFirstName} ${item.creatorUsername ? `(@${item.creatorUsername})` : ''}`;

export const RemindersList: React.FC<RemindersListProps> = ({ items, onDelete, onEdit, onCreate }) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = getNextFireDate(a)?.getTime() ?? Number.POSITIVE_INFINITY;
      const db = getNextFireDate(b)?.getTime() ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <Group mode="card">
        <Placeholder
          title="Пока нет напоминаний"
          action={
            <Button size="m" onClick={onCreate}>
              Создать напоминание
            </Button>
          }
        >
          Создайте первое напоминание для этого чата
        </Placeholder>
      </Group>
    );
  }

  return (
    <Group mode="card" header={<Header>Активные напоминания</Header>}>
      {sortedItems.map((item) => {
        const nextFire = getNextFireLabel(item);

        return (
          <SimpleCell
            key={item._id}
            data-id={item._id}
            subtitle={nextFire ? `Ближайшее: ${nextFire}` : formatFrequency(item)}
            extraSubtitle={`${formatFrequency(item)} · ${formatAuthor(item)}`}
            after={
              <IconButton
                label="Удалить напоминание"
                style={{ width: 36, height: 36, flex: 'none' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item._id);
                }}
              >
                <Trash size={20} color="var(--vkui--color_icon_negative)" />
              </IconButton>
            }
            multiline
            onClick={() => onEdit(item)}
          >
            {item.message}
          </SimpleCell>
        );
      })}
    </Group>
  );
};
