import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Placeholder, Spinner } from '@vkontakte/vkui';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useGetLlmUsage } from '@/features/llm-usage/hooks/useGetLlmUsage.ts';
import { LlmUsageContent } from '@/features/llm-usage/ui/LlmUsageContent.tsx';

export const LlmUsagePage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/settings');
  });

  const chatId = getChatId();
  const { data: summary, isLoading, isError } = useGetLlmUsage(chatId);

  if (isLoading) {
    return (
      <Group>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size="l" />
        </div>
      </Group>
    );
  }

  if (isError || !summary) {
    return (
      <Group>
        <Placeholder title="Ошибка">Не удалось загрузить статистику LLM.</Placeholder>
      </Group>
    );
  }

  return <LlmUsageContent summary={summary} />;
};
