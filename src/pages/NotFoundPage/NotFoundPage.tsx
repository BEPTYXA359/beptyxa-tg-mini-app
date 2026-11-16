import type { FC } from 'react';
import { Button, Group, Placeholder } from '@vkontakte/vkui';
import { useNavigate } from 'react-router-dom';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();
  const goHome = () => void navigate('/', { replace: true });

  useTelegramBackButton(goHome);

  return (
    <Group>
      <Placeholder
        title="Страница не найдена"
        action={<Button onClick={goHome}>На главную</Button>}
      >
        Проверьте ссылку или вернитесь на главную страницу
      </Placeholder>
    </Group>
  );
};
