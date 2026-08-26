import React from 'react';
import { Header, Skeleton } from '@vkontakte/vkui';

export const PlatesListSkeleton: React.FC = () => (
  <>
    <Header>Сохранённые номера</Header>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2, 3].map((n) => (
        <Skeleton key={n} width="100%" height={126} borderRadius={12} />
      ))}
    </div>
  </>
);
