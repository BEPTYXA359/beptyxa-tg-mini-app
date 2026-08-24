import React from 'react';
import { Group, Header, SimpleCell } from '@vkontakte/vkui';
import { CalendarClock, ExternalLink, Gamepad2, User } from 'lucide-react';
import type { Reminder } from '../model/reminders.types';

interface ReminderSteamDetailsProps {
  reminder: Reminder;
}

const MOSCOW_TIMEZONE = 'Europe/Moscow';

export const ReminderSteamDetails: React.FC<ReminderSteamDetailsProps> = ({ reminder }) => {
  const fireAt = new Date(reminder.time);
  const fireAtLabel = Number.isNaN(fireAt.getTime())
    ? reminder.time
    : `${fireAt.toLocaleString('ru-RU', {
        timeZone: MOSCOW_TIMEZONE,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })} (МСК)`;

  const subscribers = reminder.subscribers ?? [];

  return (
    <div>
      <Group mode="card" header={<Header>Напоминание о выходе игры</Header>}>
        <SimpleCell before={<Gamepad2 size={20} />} subtitle="Тип: Steam" multiline>
          {reminder.gameName || reminder.message}
        </SimpleCell>
        <SimpleCell before={<CalendarClock size={20} />} subtitle="Дата уведомления">
          {fireAtLabel}
        </SimpleCell>
        {reminder.steamAppId && (
          <SimpleCell
            before={<ExternalLink size={20} />}
            href={`https://store.steampowered.com/app/${reminder.steamAppId}`}
            target="_blank"
            rel="noreferrer"
            subtitle="Страница игры"
          >
            Открыть в Steam
          </SimpleCell>
        )}
      </Group>

      <Group mode="card" header={<Header>Кого уведомим · {subscribers.length}</Header>}>
        {subscribers.length > 0 ? (
          subscribers.map((subscriber) => (
            <SimpleCell
              key={subscriber.id}
              before={<User size={20} />}
              subtitle={subscriber.username ? `@${subscriber.username}` : undefined}
            >
              {subscriber.firstName}
            </SimpleCell>
          ))
        ) : (
          <SimpleCell>Нет подписчиков</SimpleCell>
        )}
      </Group>
    </div>
  );
};
