import React from 'react';
import { Group, Header, FormItem, Skeleton } from '@vkontakte/vkui';

export const SettingsSkeleton: React.FC = () => (
  <>
    <Group header={<Header>Грок и OpenAI</Header>}>
      <FormItem top={<Skeleton width="50%" />}>
        <Skeleton width="100%" height={36} />
      </FormItem>
      <FormItem top={<Skeleton width="40%" />}>
        <Skeleton width="100%" height={36} />
      </FormItem>
      <FormItem top={<Skeleton width="45%" />}>
        <Skeleton width="100%" height={36} />
      </FormItem>
    </Group>
    <Group header={<Header>Балабол</Header>}>
      <FormItem top={<Skeleton width="60%" />}>
        <Skeleton width="100%" height={72} />
      </FormItem>
    </Group>
  </>
);
