import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RemindersWidget } from '@/features/reminders/ui/RemindersWidget.tsx';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton();

  const chatId = getChatId();

  const { data: reminders = [] } = useGetReminders(chatId);

  return <RemindersWidget reminders={reminders} onClick={() => void navigate(`/reminders`)} />;
};
