import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomSelect, FormItem, Group, Header, Placeholder, Spinner } from '@vkontakte/vkui';
import { useGetConversionSettings } from '@/features/conversion-settings/hooks/useGetConversionSettings.ts';
import { useUpdateConversionSettings } from '@/features/conversion-settings/hooks/useUpdateConversionSettings.ts';
import {
  CONVERTER_SOURCE_OPTIONS,
  type ConverterSource,
  type UpdateConversionSettings,
} from '@/features/conversion-settings/model/conversion-settings.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

const captionStyle: React.CSSProperties = {
  padding: '0px 16px 12px',
  color: 'var(--vkui--color_text_secondary)',
  fontSize: 13,
  lineHeight: 1.35,
};

export const ConversionSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const feedback = useFeedback();

  useTelegramBackButton(() => {
    void navigate('/settings');
  });

  const chatId = getChatId();

  const { data: settings, isLoading, isError } = useGetConversionSettings(chatId);
  const { mutate } = useUpdateConversionSettings(chatId);

  const save = (patch: UpdateConversionSettings) => {
    mutate(patch, { onError: () => feedback.error('Не удалось сохранить настройку') });
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
        <Placeholder title="Ошибка">Не удалось загрузить настройки конвертации.</Placeholder>
      </Group>
    );
  }

  return (
    <Group
      mode="card"
      header={<Header>Курсы валют</Header>}
      description="Источник курсов для конвертера и примерных цен подписок"
    >
      <FormItem top="Источник">
        <CustomSelect
          value={settings.ratesSource}
          options={CONVERTER_SOURCE_OPTIONS}
          onChange={(e) => save({ ratesSource: e.target.value as ConverterSource })}
        />
      </FormItem>
      <div style={captionStyle}>
        У Т-Банка курсы направленные: продажа валюты и покупка считаются по разным курсам банка.
        Т-Банк котирует только USD, GBP и EUR — остальные валюты считаются через доллар по курсу
        банка и ЦБ РФ
      </div>
    </Group>
  );
};
