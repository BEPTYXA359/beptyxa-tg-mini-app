import React from 'react';
import { Group, Header, SimpleCell, Skeleton } from '@vkontakte/vkui';

export const RemindersListSkeleton: React.FC = () => (
  <Group header={<Header>Активные напоминания</Header>}>
    {[0, 1, 2, 3].map((n) => (
      <SimpleCell
        key={n}
        after={<Skeleton width={32} height={32} borderRadius="50%" />}
        subtitle={<Skeleton width="60%" />}
        extraSubtitle={<Skeleton width="40%" />}
        disabled
      >
        <Skeleton width="80%" />
      </SimpleCell>
    ))}
  </Group>
);
