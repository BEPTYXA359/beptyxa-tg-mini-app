import { useCallback, useState } from 'react';
import { useDeleteSubscription } from './useDeleteSubscription.ts';
import { markPendingDeletion, unmarkPendingDeletions } from '../model/pendingDeletions.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { createUndoDeleteScheduler } from '@/shared/utils/undoDeleteScheduler';

const UNDO_DELAY = 4000;
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

export const useUndoDeleteSubscription = (chatId: number | undefined) => {
  const { mutateAsync: deleteSubscription } = useDeleteSubscription(chatId);
  const feedback = useFeedback();
  const [scheduler] = useState(() =>
    createUndoDeleteScheduler({
      delayMs: UNDO_DELAY,
      onDelete: deleteSubscription,
      pending,
      onError: (id) => {
        unmarkPendingDeletions([id]);
        feedback.error('Не удалось удалить подписку');
      },
    }),
  );

  return useCallback(
    (id: string) => {
      markPendingDeletion(id);
      scheduler.schedule(id);
      feedback.undo(
        'Подписка удалена',
        () => unmarkPendingDeletions(scheduler.cancelPending()),
        UNDO_SNACKBAR_DURATION,
      );
    },
    [feedback, scheduler],
  );
};
