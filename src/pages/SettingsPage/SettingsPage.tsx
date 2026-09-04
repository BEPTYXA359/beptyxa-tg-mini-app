import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Placeholder, SimpleCell } from '@vkontakte/vkui';
import { BarChart3, ChevronRight } from 'lucide-react';
import { useGetSettings, SettingsForm } from '@/features/settings';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { SettingsSkeleton } from '@/shared/ui/Skeleton/SettingsSkeleton.tsx';
import { haptic } from '@/shared/utils/haptic.util.ts';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Group mode="card">
        <SimpleCell
          before={<BarChart3 size={24} />}
          after={<ChevronRight size={20} style={{ color: 'var(--vkui--color_icon_secondary)' }} />}
          onClick={() => {
            haptic.impact('light');
            void navigate('/llm-usage');
          }}
        >
          Статистика LLM
        </SimpleCell>
      </Group>
      <SettingsForm initialSettings={settings} chatId={chatId} />
    </div>
  );
};
