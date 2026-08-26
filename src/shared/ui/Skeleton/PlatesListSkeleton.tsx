import React from 'react';
import { Group, Header, Skeleton } from '@vkontakte/vkui';

export const PlatesListSkeleton: React.FC = () => (
  <Group header={<Header>Сохранённые номера</Header>}>
    {[0, 1, 2, 3].map((n) => (
      <div key={n} style={{ padding: '8px 12px' }}>
        <Skeleton width="100%" height={110} borderRadius={14} />
      </div>
    ))}
  </Group>
);
