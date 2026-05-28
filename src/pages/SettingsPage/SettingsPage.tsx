import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner, Text } from '@telegram-apps/telegram-ui';
import { useGetSettings, SettingsForm } from '@/features/settings';

export const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id') || undefined;

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
