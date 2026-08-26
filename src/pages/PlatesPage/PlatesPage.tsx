import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { PlatesList } from '@/features/plates/ui/PlatesList.tsx';
import {
  unmarkPendingDeletions,
  usePendingDeletionIds,
} from '@/features/plates/model/pendingDeletions.ts';
import { useGetPlates } from '@/features/plates/hooks/useGetPlates.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { Plate } from '@/features/plates/model/plates.types.ts';
import { useNavigate } from 'react-router-dom';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { haptic } from '@/shared/utils/haptic.util';
import { PlatesListSkeleton } from '@/shared/ui/Skeleton/PlatesListSkeleton.tsx';
import { BottomActionBar, BOTTOM_BAR_CLEARANCE } from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

export const PlatesPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data, isLoading, isError, isFetching, refetch } = useGetPlates(chatId);

  const pendingIds = usePendingDeletionIds();
  const plates = useMemo(
    () => (data ?? []).filter((plate) => !pendingIds.has(plate._id)),
    [data, pendingIds],
  );

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
