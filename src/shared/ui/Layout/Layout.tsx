import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabbar, TabbarItem } from '@vkontakte/vkui';
import { Home, Settings } from 'lucide-react';
import { haptic } from '@/shared/utils/haptic.util';

interface TabConfig {
  id: string;
  path: string;
  text: string;
  Icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'home', path: '/', text: 'Главная', Icon: Home },
  { id: 'settings', path: '/settings', text: 'Настройки', Icon: Settings },
];

const TABBAR_OFFSET = 'calc(48px + env(safe-area-inset-bottom, 0px))';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <main style={{ minHeight: '100dvh', paddingTop: 12, paddingBottom: TABBAR_OFFSET }}>
        <Outlet />
      </main>

      <Tabbar>
        {TABS.map(({ id, path, text, Icon }) => (
          <TabbarItem
            key={id}
            label={text}
            selected={location.pathname === path}
            onClick={() => {
              haptic.selection();
              void navigate(path);
            }}
          >
            <Icon size={28} />
          </TabbarItem>
        ))}
      </Tabbar>
    </>
  );
};
