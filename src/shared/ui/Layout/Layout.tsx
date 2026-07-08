import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { Home, Settings } from 'lucide-react';

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

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '82px',
        }}
      >
        <Outlet />
      </main>

      <Tabbar>
        {TABS.map(({ id, path, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
            selected={location.pathname === path}
            onClick={() => {
              void navigate(path);
            }}
          >
            <Icon size={24} />
          </Tabbar.Item>
        ))}
      </Tabbar>
    </div>
  );
};
