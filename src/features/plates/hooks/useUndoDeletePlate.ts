import { useCallback, useState } from 'react';
import { useDeletePlate } from './useDeletePlate.ts';
import { markPendingDeletion, unmarkPendingDeletions } from '../model/pendingDeletions.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { createUndoDeleteScheduler } from '@/shared/utils/undoDeleteScheduler';

const UNDO_DELAY = 4000;
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

export const useUndoDeletePlate = (chatId: number | undefined) => {
  const { mutateAsync: deletePlate } = useDeletePlate(chatId);
  const feedback = useFeedback();
  const [scheduler] = useState(() =>
    createUndoDeleteScheduler({
      delayMs: UNDO_DELAY,
      onDelete: deletePlate,
      pending,
      onError: (id) => {
        unmarkPendingDeletions([id]);
        feedback.error('Не удалось удалить номер');
      },
    }),
  );

  return useCallback(
    (id: string) => {
      markPendingDeletion(id);
      scheduler.schedule(id);
      feedback.undo(
        'Номер удалён',
        () => unmarkPendingDeletions(scheduler.cancelPending()),
        UNDO_SNACKBAR_DURATION,
      );
    },
    [feedback, scheduler],
  );
};
