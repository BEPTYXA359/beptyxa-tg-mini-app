import React from 'react';
import { Skeleton } from '@vkontakte/vkui';

/** Повторяет композицию страницы: SettingsRow + StatsBlock + строки списка */
export const SubscriptionsListSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Skeleton width="100%" height={64} borderRadius={12} />
    <Skeleton width="100%" height={132} borderRadius={12} />
    <Skeleton width="100%" height={72} borderRadius={12} />
    <Skeleton width="100%" height={72} borderRadius={12} />
    <Skeleton width="100%" height={72} borderRadius={12} />
  </div>
);
