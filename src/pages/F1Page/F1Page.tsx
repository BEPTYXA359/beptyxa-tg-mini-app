import { Button, Group, Placeholder, Spinner } from '@vkontakte/vkui';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetF1Overview } from '@/features/f1/hooks/useGetF1Overview';
import { F1_TABS, type F1Tab } from '@/features/f1/model/f1.types';
import { F1Calendar } from '@/features/f1/ui/F1Calendar';
import { F1Settings } from '@/features/f1/ui/F1Settings';
import { F1Standings } from '@/features/f1/ui/F1Standings';
import { F1Tabs } from '@/features/f1/ui/F1Tabs';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';
import { getEffectiveChatId } from '@/shared/utils/telegram.util';
import '@/features/f1/ui/f1.css';

export const F1Page = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const activeTab: F1Tab = F1_TABS.includes(tab as F1Tab) ? (tab as F1Tab) : 'calendar';
  const chatId = getEffectiveChatId();
  const { data: overview, isLoading, isError, refetch } = useGetF1Overview(chatId);

  useTelegramBackButton(() => {
    void navigate('/');
  });

  // настройки чата не зависят от календаря: они доступны, даже если источник сезона лёг
  if (isLoading && activeTab !== 'settings') {
    return (
      <div className="f1-loader">
        <Spinner size="l" />
      </div>
    );
  }

  const content = (() => {
    if (activeTab === 'settings') return <F1Settings chatId={chatId} />;
    if (isError || !overview) {
      return (
        <Group>
          <Placeholder
            title="Ошибка"
            action={<Button onClick={() => void refetch()}>Повторить</Button>}
          >
            Не удалось загрузить данные Ф1
          </Placeholder>
        </Group>
      );
    }
    if (activeTab === 'standings') return <F1Standings standings={overview.standings} />;
    return <F1Calendar overview={overview} chatId={chatId} />;
  })();

  return (
    <div className="f1-page">
      <h1 className="f1-title">Формула-1{overview ? ` · ${overview.season}` : ''}</h1>
      <F1Tabs active={activeTab} />
      {content}
    </div>
  );
};
