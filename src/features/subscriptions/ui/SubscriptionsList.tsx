import React, { useMemo } from 'react';
import {
  Avatar,
  Button,
  Group,
  Header,
  IconButton,
  Placeholder,
  SimpleCell,
} from '@vkontakte/vkui';
import { BellOff, CreditCard, Trash } from 'lucide-react';
import type { Subscription } from '../model/subscriptions.types';
import { PERIOD_LABELS } from '../model/subscriptions.types.ts';
import { contrastTextColor } from '../utils/color.ts';
import { convertAmount, formatMoney, formatMoneyShort } from '../utils/money.ts';
import { formatDateRu, formatNextPayment } from '../utils/nextPayment.ts';

interface SubscriptionsListProps {
  title: string;
  variant: 'active' | 'paused';
  items: Subscription[];
  baseCurrency: string;
  rates: Record<string, number> | undefined;
  onDelete: (id: string) => void;
  onEdit: (item: Subscription) => void;
  onCreate: () => void;
}

const subscriptionAvatar = (subscription: Subscription): React.ReactNode => {
  const background = subscription.color ?? 'var(--vkui--color_background_secondary_alpha)';
  const color = contrastTextColor(subscription.color);
  const letter = Array.from(subscription.name.trim())[0]?.toUpperCase() ?? '';

  return (
    <Avatar size={40} style={{ background, color }}>
      {letter || <CreditCard size={20} />}
    </Avatar>
  );
};

export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
  title,
  variant,
  items,
  baseCurrency,
  rates,
  onDelete,
  onEdit,
  onCreate,
}) => {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate)),
    [items],
  );

  if (sortedItems.length === 0) {
    if (variant === 'paused') return null;
    return (
      <Group mode="card">
        <Placeholder
          title="Пока нет подписок"
          action={
            <Button size="m" onClick={onCreate}>
              Добавить подписку
            </Button>
          }
        >
          Добавьте первую подписку, чтобы не пропустить списание
        </Placeholder>
      </Group>
    );
  }

  return (
    <Group mode="card" header={<Header>{title}</Header>}>
      {sortedItems.map((item) => {
        const approxBase =
          item.currency !== baseCurrency && rates
            ? convertAmount(item.cost, item.currency, baseCurrency, rates)
            : null;

        const priceLine = [
          formatMoney(item.cost, item.currency),
          approxBase !== null ? formatMoneyShort(approxBase, baseCurrency) : null,
        ]
          .filter(Boolean)
          .join(' ≈ ');

        const subtitleParts = [
          formatDateRu(item.nextPaymentDate),
          formatNextPayment(item.nextPaymentDate),
          PERIOD_LABELS[item.period],
        ].filter(Boolean);

        return (
          <SimpleCell
            key={item._id}
            before={subscriptionAvatar(item)}
            subtitle={subtitleParts.join(' · ')}
            extraSubtitle={priceLine}
            after={
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                {!item.notificationsEnabled && (
                  <BellOff size={16} color="var(--vkui--color_icon_secondary)" />
                )}
                <IconButton
                  label="Удалить подписку"
                  style={{ width: 36, height: 36 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item._id);
                  }}
                >
                  <Trash size={20} color="var(--vkui--color_icon_negative)" />
                </IconButton>
              </div>
            }
            multiline
            onClick={() => onEdit(item)}
          >
            {item.name}
            {item.service ? (
              <span
                style={{
                  color: 'var(--vkui--color_text_secondary)',
                  fontWeight: 'normal',
                  marginLeft: 6,
                  fontSize: 13,
                }}
              >
                {item.service}
              </span>
            ) : null}
          </SimpleCell>
        );
      })}
    </Group>
  );
};
