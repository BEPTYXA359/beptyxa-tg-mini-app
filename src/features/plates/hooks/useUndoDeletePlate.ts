import { useCallback } from 'react';
import { useDeletePlate } from './useDeletePlate.ts';
import { markPendingDeletion, unmarkPendingDeletion } from '../model/pendingDeletions.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

const UNDO_DELAY = 4000;
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;

export const useUndoDeletePlate = (chatId: number | undefined) => {
  const { mutate: deletePlate } = useDeletePlate(chatId);
  const feedback = useFeedback();

  return useCallback(
    (id: string) => {
      markPendingDeletion(id);

      let undone = false;
      let fired = false;
      const timer = setTimeout(() => {
        if (undone) return;
        fired = true;
        deletePlate(id, {
          onError: () => {
            unmarkPendingDeletion(id);
            feedback.error('Не удалось удалить номер');
          },
        });
      }, UNDO_DELAY);

      feedback.undo(
        'Номер удалён',
        () => {
          if (fired) return;
          undone = true;
          clearTimeout(timer);
          unmarkPendingDeletion(id);
        },
        UNDO_SNACKBAR_DURATION,
      );
    },
    [deletePlate, feedback],
  );
};
