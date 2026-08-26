import React from 'react';
import { Group, Header, SimpleCell, Skeleton } from '@vkontakte/vkui';

export const PlatesListSkeleton: React.FC = () => (
  <Group header={<Header>Сохранённые номера</Header>}>
    {[0, 1, 2, 3].map((n) => (
      <SimpleCell
        key={n}
        before={<Skeleton width={140} height={36} borderRadius={8} />}
        subtitle={<Skeleton width="60%" />}
        disabled
      >
        <Skeleton width="50%" />
      </SimpleCell>
    ))}
  </Group>
);
