import React from 'react';
import { Group, Header, SimpleCell } from '@vkontakte/vkui';
import type { CurrencyRates, Subscription } from '../model/subscriptions.types';
import { hasRates, formatMoneyShort } from '../utils/money.ts';
import { totalCosts } from '../utils/stats.ts';

interface StatsBlockProps {
  subscriptions: Subscription[];
  baseCurrency: string;
  rates: CurrencyRates | undefined;
}

export const StatsBlock: React.FC<StatsBlockProps> = ({ subscriptions, baseCurrency, rates }) => {
  if (subscriptions.length === 0) return null;

  const totals = hasRates(rates) ? totalCosts(subscriptions, baseCurrency, rates) : null;

  return (
    <Group mode="card" header={<Header>Статистика</Header>}>
      <SimpleCell
        disabled
        after={<b>{totals ? formatMoneyShort(totals.monthly, baseCurrency) : '—'}</b>}
      >
        В месяц
      </SimpleCell>
      <SimpleCell
        disabled
        after={<b>{totals ? formatMoneyShort(totals.yearly, baseCurrency) : '—'}</b>}
      >
        В год
      </SimpleCell>
    </Group>
  );
};
