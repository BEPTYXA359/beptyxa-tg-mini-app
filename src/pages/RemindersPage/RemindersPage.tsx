import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { RemindersList } from '@/features/reminders/ui/RemindersList';
import {
  unmarkPendingDeletions,
  usePendingDeletionIds,
} from '@/features/reminders/model/pendingDeletions.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { useUndoDeleteReminder } from '@/features/reminders/hooks/useUndoDeleteReminder';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { Reminder } from '@/features/reminders/model/reminders.types.ts';
import { useNavigate } from 'react-router-dom';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { haptic } from '@/shared/utils/haptic.util';
import { RemindersListSkeleton } from '@/shared/ui/Skeleton/RemindersListSkeleton.tsx';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
} from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data, isLoading, isError, isFetching, refetch } = useGetReminders(chatId);
  const deleteWithUndo = useUndoDeleteReminder(chatId);

  const pendingIds = usePendingDeletionIds();
  const reminders = useMemo(
    () => (data ?? []).filter((reminder) => !pendingIds.has(reminder._id)),
    [data, pendingIds],
  );

  useEffect(() => {
    if (data === undefined) return;
    const serverIds = new Set(data.map((reminder) => reminder._id));
    const confirmed = [...pendingIds].filter((id) => !serverIds.has(id));
    if (confirmed.length > 0) {
      unmarkPendingDeletions(confirmed);
    }
  }, [data, pendingIds]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleOpenReminder = (reminder: Reminder) => {
    void navigate(`/reminders/${reminder._id}/edit`);
  };

  if (isLoading) {
    return <RemindersListSkeleton />;
  }

  if (isError) {
    return (
      <Group>
        <Placeholder
          title="Ошибка"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        >
          Не удалось загрузить напоминания
        </Placeholder>
      </Group>
    );
  }

  return (
    <>
      <div style={{ paddingBottom: BOTTOM_BAR_CLEARANCE }}>
        <PullToRefresh isFetching={isRefreshing || isFetching} onRefresh={handleRefresh}>
          <RemindersList
            items={reminders}
            onDelete={deleteWithUndo}
            onEdit={handleOpenReminder}
            onView={handleOpenReminder}
            onCreate={() => void navigate('/reminders/new')}
          />
        </PullToRefresh>
      </div>

      <BottomActionBar>
        <Button
          size="l"
          stretched
          onClick={() => {
            haptic.impact('light');
            void navigate('/reminders/new');
          }}
        >
          Добавить напоминание
        </Button>
      </BottomActionBar>
    </>
  );
};
