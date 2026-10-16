import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomSelect, FormItem, Group, Header, Placeholder, Slider, Spinner } from '@vkontakte/vkui';
import { useGetConversionSettings } from '@/features/conversion-settings/hooks/useGetConversionSettings';
import { useUpdateConversionSettings } from '@/features/conversion-settings/hooks/useUpdateConversionSettings';
import {
  CONVERTER_SOURCE_OPTIONS,
  STEAM_PATH_OPTIONS,
  STEAM_REGION_OPTIONS,
  STEAM_TARGET_CURRENCY_FALLBACK,
  type ConverterSource,
  type SteamConversionPath,
  type UpdateConversionSettings,
} from '@/features/conversion-settings/model/conversion-settings.types';
import { useGetCurrencyRates } from '@/features/subscriptions/hooks/useGetCurrencyRates';
import { getRateCurrencies, hasRates } from '@/features/subscriptions/utils/money';
import { currencyFlag } from '@/features/converter/model/currency-flag';
import { getChatId } from '@/shared/utils/telegram.util';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';
import { useFeedback } from '@/shared/ui/Feedback/feedback';

const captionStyle: React.CSSProperties = {
  padding: '0px 16px 12px',
  color: 'var(--vkui--color_text_secondary)',
  fontSize: 13,
  lineHeight: 1.35,
};

const EXTRA_PERCENT_SAVE_DEBOUNCE_MS = 400;

export const SteamSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/settings');
  });

  const chatId = getChatId();

  const { data: settings, isLoading, isError } = useGetConversionSettings(chatId);
  const { mutate } = useUpdateConversionSettings(chatId);
  const { data: steamRates } = useGetCurrencyRates({ source: 'steam' });

  const steamCurrencyOptions = useMemo(() => {
    const codes = hasRates(steamRates) ? getRateCurrencies(steamRates) : [];
    if (codes.length === 0) return STEAM_TARGET_CURRENCY_FALLBACK;
    return codes.map((code) => ({ label: `${currencyFlag(code)} ${code}`, value: code }));
  }, [steamRates]);

  const save = (patch: UpdateConversionSettings) => {
    mutate(patch, { onError: () => feedback.error('Не удалось сохранить настройку') });
  };

  // слайдер тянет много промежуточных значений — сохраняем с задержкой
  const [extraPercent, setExtraPercent] = useState<number | null>(null);
  const extraPercentSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeExtraPercent = (value: number) => {
    setExtraPercent(value);
    if (extraPercentSaveTimerRef.current) clearTimeout(extraPercentSaveTimerRef.current);
    extraPercentSaveTimerRef.current = setTimeout(() => {
      save({ steam: { extraPercent: value } });
    }, EXTRA_PERCENT_SAVE_DEBOUNCE_MS);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <Group>
        <Placeholder title="Ошибка">Не удалось загрузить настройки Steam.</Placeholder>
      </Group>
    );
  }

  return (
    <Group
      mode="card"
      header={<Header>Steam</Header>}
      description="Как считаются цены по ссылкам на игры; у Steam свой источник курса"
    >
      <FormItem top="Источник курса">
        <CustomSelect
          value={settings.steam.ratesSource ?? 'openexchangerates'}
          options={CONVERTER_SOURCE_OPTIONS}
          onChange={(e) =>
            save({ steam: { ratesSource: e.target.value as ConverterSource } })
          }
        />
      </FormItem>
      <FormItem top="Регион игры">
        <CustomSelect
          value={settings.steam.region}
          options={STEAM_REGION_OPTIONS}
          searchable
          onChange={(e) => save({ steam: { region: e.target.value } })}
        />
      </FormItem>
      <FormItem top="Валюта конвертации">
        <CustomSelect
          value={settings.steam.targetCurrency}
          options={steamCurrencyOptions}
          searchable
          onChange={(e) => save({ steam: { targetCurrency: e.target.value } })}
        />
      </FormItem>
      <FormItem top="Путь конвертации">
        <CustomSelect
          value={settings.steam.path}
          options={STEAM_PATH_OPTIONS}
          onChange={(e) => save({ steam: { path: e.target.value as SteamConversionPath } })}
        />
      </FormItem>
      <FormItem
        top={`Доп. процент (комиссия): ${extraPercent ?? settings.steam.extraPercent ?? 0}%`}
      >
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={extraPercent ?? settings.steam.extraPercent ?? 0}
          onChange={changeExtraPercent}
        />
      </FormItem>
      <div style={{ ...captionStyle, whiteSpace: 'pre-line' }}>
        {
          'Как считается цена:\n• «Всё по курсу конвертера» — напрямую из валюты региона в выбранную валюту, по выбранному выше источнику\n• «Steam → USD → курс конвертера» — цена переводится в доллары по курсу Steam, затем доллары покупаются за выбранную валюту по этому же источнику (для Т-Банка — по курсу продажи)\n• «Всё по курсу Steam» — напрямую по внутреннему курсу Steam\n\nДоп. процент — запас на комиссию банка или сервиса сверх конвертации'
        }
      </div>
    </Group>
  );
};
