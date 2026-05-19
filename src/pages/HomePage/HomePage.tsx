import React from 'react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';

export const HomePage: React.FC = () => {
  return (
    <List>
      <Placeholder header="Пока что пусто..." />
    </List>
  );
};
