import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { RemindersList } from '@/features/reminders/ui/RemindersList';
import { useDeleteReminders } from '@/features/reminders/hooks/useDeleteReminders.ts';
import {
  markPendingDeletion,
  unmarkPendingDeletion,
  unmarkPendingDeletions,
  usePendingDeletionIds,
} from '@/features/reminders/model/pendingDeletions.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { Reminder } from '@/features/reminders/model/reminders.types.ts';
import { useNavigate } from 'react-router-dom';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { haptic } from '@/shared/utils/haptic.util';
import { RemindersListSkeleton } from '@/shared/ui/Skeleton/RemindersListSkeleton.tsx';
import { BottomActionBar, BOTTOM_BAR_CLEARANCE } from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

const UNDO_DELAY = 4000;
// снекбар начинает отсчёт после анимации появления, поэтому гасим его до отправки DELETE
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data, isLoading, isError, isFetching, refetch } = useGetReminders(chatId);
  const { mutate: deleteReminder } = useDeleteReminders(chatId);

  const pendingIds = usePendingDeletionIds();
  const reminders = useMemo(
    () => (data ?? []).filter((reminder) => !pendingIds.has(reminder._id)),
    [data, pendingIds],
  );

  // удаление подтверждено сервером, когда очередной ответ больше не содержит id
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
    void navigate('/reminders/form', { state: { reminder } });
  };

  const handleDelete = useCallback(
    (id: string) => {
      markPendingDeletion(id);

      let undone = false;
      let fired = false;
      const timer = setTimeout(() => {
        if (undone) return;
        fired = true;
        deleteReminder(id, {
          onError: () => {
            unmarkPendingDeletion(id);
            feedback.error('Не удалось удалить напоминание');
          },
        });
      }, UNDO_DELAY);

      feedback.undo(
        'Напоминание удалено',
        () => {
          if (fired) return;
          undone = true;
          clearTimeout(timer);
          unmarkPendingDeletion(id);
        },
        UNDO_SNACKBAR_DURATION,
      );
    },
    [deleteReminder, feedback],
  );

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
            onDelete={handleDelete}
            onEdit={handleOpenReminder}
            onView={handleOpenReminder}
            onCreate={() => void navigate('/reminders/form')}
          />
        </PullToRefresh>
      </div>

      <BottomActionBar>
        <Button
          size="l"
          stretched
          onClick={() => {
            haptic.impact('light');
            void navigate('/reminders/form');
          }}
        >
          Добавить напоминание
        </Button>
      </BottomActionBar>
    </>
  );
};
