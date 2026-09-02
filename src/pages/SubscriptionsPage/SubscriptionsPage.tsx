import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Group, Placeholder, PullToRefresh } from '@vkontakte/vkui';
import { useNavigate } from 'react-router-dom';
import { useGetSubscriptions } from '@/features/subscriptions/hooks/useGetSubscriptions.ts';
import { useGetSubscriptionSettings } from '@/features/subscriptions/hooks/useGetSubscriptionSettings.ts';
import { useGetCurrencyRates } from '@/features/subscriptions/hooks/useGetCurrencyRates.ts';
import { useUndoDeleteSubscription } from '@/features/subscriptions/hooks/useUndoDeleteSubscription.ts';
import { useUpdateSubscriptionSettings } from '@/features/subscriptions/hooks/useUpdateSubscriptionSettings.ts';
import {
  unmarkPendingDeletions,
  usePendingDeletionIds,
} from '@/features/subscriptions/model/pendingDeletions.ts';
import { SettingsRow } from '@/features/subscriptions/ui/SettingsRow.tsx';
import { StatsBlock } from '@/features/subscriptions/ui/StatsBlock.tsx';
import { SubscriptionsList } from '@/features/subscriptions/ui/SubscriptionsList.tsx';
import {
  type Subscription,
  DEFAULT_BASE_CURRENCY,
} from '@/features/subscriptions/model/subscriptions.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';
import { SubscriptionsListSkeleton } from '@/shared/ui/Skeleton/SubscriptionsListSkeleton.tsx';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
} from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data, isLoading, isError, isFetching, refetch } = useGetSubscriptions(chatId);
  const { data: settings } = useGetSubscriptionSettings(chatId);
  const { data: rates } = useGetCurrencyRates();
  const deleteWithUndo = useUndoDeleteSubscription(chatId);
  const { mutateAsync: saveSettings } = useUpdateSubscriptionSettings(chatId);

  const baseCurrency = settings?.baseCurrency ?? DEFAULT_BASE_CURRENCY;

  const pendingIds = usePendingDeletionIds();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const allItems = useMemo(
    () => (data ?? []).filter((item) => !pendingIds.has(item._id)),
    [data, pendingIds],
  );

  useEffect(() => {
    if (data === undefined) return;
    const serverIds = new Set(data.map((item) => item._id));
    const confirmed = [...pendingIds].filter((id) => !serverIds.has(id));
    if (confirmed.length > 0) {
      unmarkPendingDeletions(confirmed);
    }
  }, [data, pendingIds]);

  const active = useMemo(() => allItems.filter((item) => item.status === 'active'), [allItems]);
  const paused = useMemo(() => allItems.filter((item) => item.status === 'paused'), [allItems]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleEdit = useCallback(
    (item: Subscription) => {
      haptic.impact('light');
      void navigate('/subscriptions/form', { state: { subscription: item } });
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (id: string) => {
      haptic.impact('medium');
      deleteWithUndo(id);
    },
    [deleteWithUndo],
  );

  const handleSaveCurrency = useCallback(
    (currency: string) => {
      saveSettings({ baseCurrency: currency }).catch(() =>
        feedback.error('Не удалось сохранить валюту'),
      );
    },
    [saveSettings, feedback],
  );

  if (isLoading) {
    return <SubscriptionsListSkeleton />;
  }

  if (isError) {
    return (
      <Group>
        <Placeholder
          title="Ошибка"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        >
          Не удалось загрузить подписки
        </Placeholder>
      </Group>
    );
  }

  return (
    <>
      <div style={{ paddingBottom: BOTTOM_BAR_CLEARANCE }}>
        <PullToRefresh isFetching={isRefreshing || isFetching} onRefresh={handleRefresh}>
          <SettingsRow baseCurrency={baseCurrency} onSave={handleSaveCurrency} />
          <StatsBlock subscriptions={active} baseCurrency={baseCurrency} rates={rates} />
          <SubscriptionsList
            title="Активные"
            variant="active"
            items={active}
            baseCurrency={baseCurrency}
            rates={rates?.rates}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onCreate={() => void navigate('/subscriptions/form')}
          />
          <SubscriptionsList
            title="На паузе"
            variant="paused"
            items={paused}
            baseCurrency={baseCurrency}
            rates={rates?.rates}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onCreate={() => void navigate('/subscriptions/form')}
          />
        </PullToRefresh>
      </div>

      <BottomActionBar>
        <Button
          size="l"
          stretched
          onClick={() => {
            haptic.impact('light');
            void navigate('/subscriptions/form');
          }}
        >
          Добавить подписку
        </Button>
      </BottomActionBar>
    </>
  );
};
