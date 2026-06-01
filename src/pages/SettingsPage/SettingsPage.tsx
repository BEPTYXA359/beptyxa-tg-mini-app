import React from 'react';
import { Spinner, Text } from '@telegram-apps/telegram-ui';
import { useGetSettings, SettingsForm } from '@/features/settings';
import { getChatId } from '@/shared/utils/telegram.util.ts';

export const SettingsPage: React.FC = () => {
  const chatId = getChatId();

  const { data: settings, isLoading, isError } = useGetSettings(chatId);

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{ padding: 20, color: 'var(--tgui--destructive_text_color)', textAlign: 'center' }}
      >
        <Text weight="1">Ошибка загрузки настроек сервера.</Text>
      </div>
    );
  }
  if (!settings) return null;

  return <SettingsForm initialSettings={settings} chatId={chatId} />;
};
