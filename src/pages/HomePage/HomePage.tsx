import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RemindersWidget } from '@/features/reminders/ui/RemindersWidget.tsx';
import { PlatesWidget } from '@/features/plates/ui/PlatesWidget.tsx';
import { SubscriptionsWidget } from '@/features/subscriptions/ui/SubscriptionsWidget.tsx';
import { ConverterWidget } from '@/features/converter/ui/ConverterWidget.tsx';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { usePendingDeletionIds } from '@/features/reminders/model/pendingDeletions.ts';
import { useGetPlates } from '@/features/plates/hooks/useGetPlates.ts';
import { usePendingDeletionIds as usePendingPlateDeletionIds } from '@/features/plates/model/pendingDeletions.ts';
import { useGetSubscriptions } from '@/features/subscriptions/hooks/useGetSubscriptions.ts';
import { usePendingDeletionIds as usePendingSubscriptionDeletionIds } from '@/features/subscriptions/model/pendingDeletions.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { HomeWidgetState } from './HomeWidgetState';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton();

  const chatId = getChatId();

  const remindersQuery = useGetReminders(chatId);
  const remindersData = useMemo(() => remindersQuery.data ?? [], [remindersQuery.data]);
  const reminderPendingIds = usePendingDeletionIds();
  const reminders = useMemo(
    () => remindersData.filter((reminder) => !reminderPendingIds.has(reminder._id)),
    [remindersData, reminderPendingIds],
  );

  const platesQuery = useGetPlates(chatId);
  const platesData = useMemo(() => platesQuery.data ?? [], [platesQuery.data]);
  const platePendingIds = usePendingPlateDeletionIds();
  const plates = useMemo(
    () => platesData.filter((plate) => !platePendingIds.has(plate._id)),
    [platesData, platePendingIds],
  );

  const subscriptionsQuery = useGetSubscriptions(chatId);
  const subscriptionsData = useMemo(() => subscriptionsQuery.data ?? [], [subscriptionsQuery.data]);
  const subscriptionPendingIds = usePendingSubscriptionDeletionIds();
  const subscriptions = useMemo(
    () => subscriptionsData.filter((item) => !subscriptionPendingIds.has(item._id)),
    [subscriptionsData, subscriptionPendingIds],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {remindersQuery.isLoading || remindersQuery.isError ? (
        <HomeWidgetState
          title="Напоминания"
          entityLabel="напоминания"
          isLoading={remindersQuery.isLoading}
          isError={remindersQuery.isError}
          onRetry={() => void remindersQuery.refetch()}
        />
      ) : (
        <RemindersWidget reminders={reminders} onClick={() => void navigate('/reminders')} />
      )}
      {platesQuery.isLoading || platesQuery.isError ? (
        <HomeWidgetState
          title="Номера"
          entityLabel="номера"
          isLoading={platesQuery.isLoading}
          isError={platesQuery.isError}
          onRetry={() => void platesQuery.refetch()}
        />
      ) : (
        <PlatesWidget plates={plates} onClick={() => void navigate('/plates')} />
      )}
      {subscriptionsQuery.isLoading || subscriptionsQuery.isError ? (
        <HomeWidgetState
          title="Подписки"
          entityLabel="подписки"
          isLoading={subscriptionsQuery.isLoading}
          isError={subscriptionsQuery.isError}
          onRetry={() => void subscriptionsQuery.refetch()}
        />
      ) : (
        <SubscriptionsWidget
          subscriptions={subscriptions}
          onClick={() => void navigate('/subscriptions')}
        />
      )}
      <ConverterWidget onClick={() => void navigate('/converter')} />
    </div>
  );
};
