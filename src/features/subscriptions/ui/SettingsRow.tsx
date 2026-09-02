import React from 'react';
import { CustomSelect, Group, SimpleCell } from '@vkontakte/vkui';
import { CURRENCY_OPTIONS } from '../model/subscriptions.types.ts';

interface SettingsRowProps {
  baseCurrency: string;
  onSave: (currency: string) => void;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ baseCurrency, onSave }) => (
  <Group mode="card">
    <SimpleCell
      after={
        <CustomSelect
          value={baseCurrency}
          options={CURRENCY_OPTIONS}
          style={{ width: 120, flex: 'none' }}
          onChange={(e) => onSave(e.target.value)}
        />
      }
    >
      Валюта
    </SimpleCell>
    <div
      style={{
        padding: '0px 16px 0px',
        color: 'var(--vkui--color_text_secondary)',
        fontSize: 13,
        lineHeight: 1.35,
      }}
    >
      В этой валюте считаются статистика и примерные цены
    </div>
  </Group>
);
