import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Header, SimpleCell } from '@vkontakte/vkui';
import { ArrowLeftRight, BarChart3, Bot, ChevronRight, Drama, Gamepad2 } from 'lucide-react';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';
import { haptic } from '@/shared/utils/haptic.util';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, path }) => {
  const navigate = useNavigate();

  return (
    <SimpleCell
      before={icon}
      after={<ChevronRight size={20} style={{ color: 'var(--vkui--color_icon_secondary)' }} />}
      onClick={() => {
        haptic.impact('light');
        void navigate(path);
      }}
    >
      {label}
    </SimpleCell>
  );
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Group mode="card" header={<Header>AI-чат</Header>}>
        <MenuItem icon={<Bot size={24} />} label="Настройки LLM" path="/llm-settings" />
        <MenuItem icon={<Drama size={24} />} label="Настройки Балабола" path="/chatterbox-settings" />
        <MenuItem icon={<BarChart3 size={24} />} label="Статистика LLM" path="/llm-usage" />
      </Group>
      <Group mode="card" header={<Header>Конвертер и Steam</Header>}>
        <MenuItem
          icon={<ArrowLeftRight size={24} />}
          label="Настройки конвертера"
          path="/conversion-settings"
        />
        <MenuItem icon={<Gamepad2 size={24} />} label="Настройки Steam" path="/steam-settings" />
      </Group>
    </div>
  );
};
