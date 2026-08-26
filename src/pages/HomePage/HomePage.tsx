import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RemindersWidget } from '@/features/reminders/ui/RemindersWidget.tsx';
import { PlatesWidget } from '@/features/plates/ui/PlatesWidget.tsx';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { usePendingDeletionIds } from '@/features/reminders/model/pendingDeletions.ts';
import { useGetPlates } from '@/features/plates/hooks/useGetPlates.ts';
import { usePendingDeletionIds as usePendingPlateDeletionIds } from '@/features/plates/model/pendingDeletions.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton();

  const chatId = getChatId();

  const { data: remindersData = [] } = useGetReminders(chatId);
  const reminderPendingIds = usePendingDeletionIds();
  const reminders = useMemo(
    () => remindersData.filter((reminder) => !reminderPendingIds.has(reminder._id)),
    [remindersData, reminderPendingIds],
  );

  const { data: platesData = [] } = useGetPlates(chatId);
  const platePendingIds = usePendingPlateDeletionIds();
  const plates = useMemo(
    () => platesData.filter((plate) => !platePendingIds.has(plate._id)),
    [platesData, platePendingIds],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <RemindersWidget reminders={reminders} onClick={() => void navigate(`/reminders`)} />
      <PlatesWidget plates={plates} onClick={() => void navigate(`/plates`)} />
    </div>
  );
};
