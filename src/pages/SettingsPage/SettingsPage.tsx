import React from 'react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useGetSettings, SettingsForm } from '@/features/settings';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading, isError } = useGetSettings();

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 20, color: 'var(--tgui--destructive_text_color)' }}>
        Ошибка загрузки настроек сервера.
      </div>
    );
  }
  if (!settings) return null;

  return <SettingsForm initialSettings={settings} />;
};
