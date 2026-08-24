import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { RemindersList } from '@/features/reminders/ui/RemindersList';
import { useDeleteReminders } from '@/features/reminders/hooks/useDeleteReminders.ts';
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

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();
  const queryKey = useMemo(() => ['reminders', chatId] as const, [chatId]);

  const { data: reminders = [], isLoading, isError, isFetching, refetch } = useGetReminders(chatId);
  const { mutate: deleteReminder } = useDeleteReminders(chatId);

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
      const snapshot = reminders.find((r) => r._id === id);
      if (!snapshot) return;

      queryClient.setQueryData<Reminder[]>(queryKey, (list) =>
        (list ?? []).filter((r) => r._id !== id),
      );

      let undone = false;
      const timer = setTimeout(() => {
        if (!undone) {
          deleteReminder(id, {
            onError: () => feedback.error('Не удалось удалить напоминание'),
          });
        }
      }, UNDO_DELAY);

      feedback.undo('Напоминание удалено', () => {
        undone = true;
        clearTimeout(timer);
        queryClient.setQueryData<Reminder[]>(queryKey, (list) => [...(list ?? []), snapshot]);
      });
    },
    [reminders, queryClient, queryKey, deleteReminder, feedback],
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
