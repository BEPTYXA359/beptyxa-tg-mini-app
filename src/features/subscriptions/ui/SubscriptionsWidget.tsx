import React, { useMemo } from 'react';
import { Avatar, Banner } from '@vkontakte/vkui';
import { CreditCard } from 'lucide-react';
import type { Subscription } from '../model/subscriptions.types.ts';
import { DEFAULT_BASE_CURRENCY } from '../model/subscriptions.types.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetSubscriptionSettings } from '../hooks/useGetSubscriptionSettings.ts';
import { useGetCurrencyRates } from '../hooks/useGetCurrencyRates.ts';
import { hasRates } from '../utils/money.ts';
import { totalCosts } from '../utils/stats.ts';
import { formatMoneyShort } from '../utils/money.ts';

interface SubscriptionsWidgetProps {
  onClick: () => void;
  subscriptions: Subscription[];
}

export const SubscriptionsWidget: React.FC<SubscriptionsWidgetProps> = ({
  onClick,
  subscriptions,
}) => {
  const chatId = getChatId();

  const active = useMemo(
    () => subscriptions.filter((item) => item.status === 'active'),
    [subscriptions],
  );

  // Настройки и курсы нужны только когда есть что считать
  const { data: settings } = useGetSubscriptionSettings(chatId, {
    enabled: active.length > 0,
  });
  const { data: rates } = useGetCurrencyRates({ enabled: active.length > 0 });

  const { count, subtitle } = useMemo(() => {
    if (active.length === 0) return { count: 0, subtitle: 'Подписок пока нет' };

    const baseCurrency = settings?.baseCurrency ?? DEFAULT_BASE_CURRENCY;
    const totals = hasRates(rates) ? totalCosts(active, baseCurrency, rates) : null;

    return {
      count: active.length,
      subtitle: totals
        ? `≈ ${formatMoneyShort(totals.monthly, baseCurrency)} в месяц`
        : `Активных: ${active.length}`,
    };
  }, [active, settings, rates]);

  return (
    <Banner
      mode="tint"
      before={
        <Avatar size={40} style={{ background: 'var(--vkui--color_background_accent)' }}>
          <CreditCard size={20} color="var(--vkui--color_background_contrast)" />
        </Avatar>
      }
      title={count > 0 ? `Подписки · ${count}` : 'Подписки'}
      subtitle={subtitle}
      after="chevron"
      onClick={() => {
        haptic.impact('light');
        onClick();
      }}
    />
  );
};
