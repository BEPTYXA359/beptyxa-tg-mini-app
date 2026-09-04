import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormItem, Group, Header, SegmentedControl } from '@vkontakte/vkui';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { CurrencyConverter } from '@/features/converter/ui/CurrencyConverter.tsx';
import { UnitsConverter } from '@/features/converter/ui/UnitsConverter.tsx';

type ConverterTab = 'currency' | 'units';

const TAB_OPTIONS = [
  { label: 'Валюты', value: 'currency' },
  { label: 'Величины', value: 'units' },
];

export const ConverterPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ConverterTab>('currency');

  useTelegramBackButton(() => {
    void navigate('/');
  });

  return (
    <Group mode="card" header={<Header>Конвертер</Header>}>
      <FormItem>
        <SegmentedControl
          value={tab}
          options={TAB_OPTIONS}
          onChange={(value) => setTab(value as ConverterTab)}
        />      </FormItem>

      {tab === 'currency' ? <CurrencyConverter /> : <UnitsConverter />}
    </Group>
  );
};
