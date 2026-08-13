import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Placeholder } from '@vkontakte/vkui';
import { useGetSettings, SettingsForm } from '@/features/settings';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { SettingsSkeleton } from '@/shared/ui/Skeleton/SettingsSkeleton.tsx';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const { data: settings, isLoading, isError } = useGetSettings(chatId);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (isError) {
    return (
      <Group>
        <Placeholder title="Ошибка">Не удалось загрузить настройки сервера.</Placeholder>
      </Group>
    );
  }

  if (!settings) return null;

  return <SettingsForm initialSettings={settings} chatId={chatId} />;
};
