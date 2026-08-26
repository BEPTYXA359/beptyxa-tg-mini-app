import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { PlatesList } from '@/features/plates/ui/PlatesList.tsx';
import { useDeletePlate } from '@/features/plates/hooks/useDeletePlate.ts';
import {
  markPendingDeletion,
  unmarkPendingDeletion,
  unmarkPendingDeletions,
  usePendingDeletionIds,
} from '@/features/plates/model/pendingDeletions.ts';
import { useGetPlates } from '@/features/plates/hooks/useGetPlates.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { Plate } from '@/features/plates/model/plates.types.ts';
import { useNavigate } from 'react-router-dom';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { haptic } from '@/shared/utils/haptic.util';
import { PlatesListSkeleton } from '@/shared/ui/Skeleton/PlatesListSkeleton.tsx';
import { BottomActionBar, BOTTOM_BAR_CLEARANCE } from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

const UNDO_DELAY = 4000;
// снекбар начинает отсчёт после анимации появления, поэтому гасим его до отправки DELETE
const UNDO_SNACKBAR_DURATION = UNDO_DELAY - 600;

export const PlatesPage: React.FC = () => {
  const navigate = useNavigate();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data, isLoading, isError, isFetching, refetch } = useGetPlates(chatId);
  const { mutate: deletePlate } = useDeletePlate(chatId);

  const pendingIds = usePendingDeletionIds();
  const plates = useMemo(
    () => (data ?? []).filter((plate) => !pendingIds.has(plate._id)),
    [data, pendingIds],
  );

  // удаление подтверждено сервером, когда очередной ответ больше не содержит id
  useEffect(() => {
    if (data === undefined) return;
    const serverIds = new Set(data.map((plate) => plate._id));
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

  const handleOpenPlate = (plate: Plate) => {
    void navigate('/plates/form', { state: { plate } });
  };

  const handleDelete = useCallback(
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

  if (isLoading) {
    return <PlatesListSkeleton />;
  }

  if (isError) {
    return (
      <Group>
        <Placeholder title="Ошибка" action={<Button onClick={() => void refetch()}>Повторить</Button>}>
          Не удалось загрузить номера
        </Placeholder>
      </Group>
    );
  }

  return (
    <>
      <div style={{ paddingBottom: BOTTOM_BAR_CLEARANCE }}>
        <PullToRefresh isFetching={isRefreshing || isFetching} onRefresh={handleRefresh}>
          <PlatesList
            items={plates}
            onDelete={handleDelete}
            onEdit={handleOpenPlate}
            onCreate={() => void navigate('/plates/form')}
          />
        </PullToRefresh>
      </div>

      <BottomActionBar>
        <Button
          size="l"
          stretched
          onClick={() => {
            haptic.impact('light');
            void navigate('/plates/form');
          }}
        >
          Добавить номер
        </Button>
      </BottomActionBar>
    </>
  );
};
