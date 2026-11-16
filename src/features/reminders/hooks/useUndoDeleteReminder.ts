import { useCallback, useState } from 'react';
import { useDeleteReminders } from './useDeleteReminders.ts';
import { markPendingDeletion, unmarkPendingDeletions } from '../model/pendingDeletions.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { createUndoDeleteScheduler } from '@/shared/utils/undoDeleteScheduler';

const UNDO_DELAY = 4000;
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

export const useUndoDeleteReminder = (chatId: number | undefined) => {
  const { mutateAsync: deleteReminder } = useDeleteReminders(chatId);
  const feedback = useFeedback();
  const [scheduler] = useState(() =>
    createUndoDeleteScheduler({
      delayMs: UNDO_DELAY,
      onDelete: deleteReminder,
      pending,
      onError: (id) => {
        unmarkPendingDeletions([id]);
        feedback.error('Не удалось удалить напоминание');
      },
    }),
  );

  return useCallback(
    (id: string) => {
      markPendingDeletion(id);
      scheduler.schedule(id);
      feedback.undo(
        'Напоминание удалено',
        () => unmarkPendingDeletions(scheduler.cancelPending()),
        UNDO_SNACKBAR_DURATION,
      );
    },
    [feedback, scheduler],
  );
};
