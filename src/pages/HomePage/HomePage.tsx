import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from '@telegram-apps/telegram-ui';
import { RemindersWidget } from '@/features/reminders/ui/RemindersWidget.tsx';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton();

  const chatId = getChatId();

  const { data: reminders = [] } = useGetReminders(chatId);

  return (
    <List style={{ padding: '8px 12px 66px 12px' }}>
      <RemindersWidget activeCount={reminders.length} onClick={() => void navigate(`/reminders`)} />
    </List>
  );
};
