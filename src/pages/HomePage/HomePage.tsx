import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RemindersWidget } from '@/features/reminders/ui/RemindersWidget.tsx';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { usePendingDeletionIds } from '@/features/reminders/model/pendingDeletions.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton();

  const chatId = getChatId();

  const { data = [] } = useGetReminders(chatId);
  const pendingIds = usePendingDeletionIds();
  const reminders = useMemo(
    () => data.filter((reminder) => !pendingIds.has(reminder._id)),
    [data, pendingIds],
  );

  return <RemindersWidget reminders={reminders} onClick={() => void navigate(`/reminders`)} />;
};
