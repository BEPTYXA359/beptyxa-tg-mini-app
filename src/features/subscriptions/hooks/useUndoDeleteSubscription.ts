import { useCallback } from 'react';
import { useDeleteSubscription } from './useDeleteSubscription.ts';
import { markPendingDeletion, unmarkPendingDeletion } from '../model/pendingDeletions.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

const UNDO_DELAY = 4000;
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;

export const useUndoDeleteSubscription = (chatId: number | undefined) => {
  const { mutate: deleteSubscription } = useDeleteSubscription(chatId);
  const feedback = useFeedback();

  return useCallback(
    (id: string) => {
      markPendingDeletion(id);

      let undone = false;
      let fired = false;
      const timer = setTimeout(() => {
        if (undone) return;
        fired = true;
        deleteSubscription(id, {
          onError: () => {
            unmarkPendingDeletion(id);
            feedback.error('Не удалось удалить подписку');
          },
        });
      }, UNDO_DELAY);

      feedback.undo(
        'Подписка удалена',
        () => {
          if (fired) return;
          undone = true;
          clearTimeout(timer);
          unmarkPendingDeletion(id);
        },
        UNDO_SNACKBAR_DURATION,
      );
    },
    [deleteSubscription, feedback],
  );
};
