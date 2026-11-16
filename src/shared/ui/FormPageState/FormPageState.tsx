import React from 'react';
import { Button, Group, Placeholder, Spinner } from '@vkontakte/vkui';

interface FormPageStateProps {
  isLoading: boolean;
  isError: boolean;
  notFound: boolean;
  entityName: string;
  onRetry: () => void;
  onBack: () => void;
}

export const FormPageState: React.FC<FormPageStateProps> = ({
  isLoading,
  isError,
  notFound,
  entityName,
  onRetry,
  onBack,
}) => {
  if (isLoading) {
    return (
      <Group>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size="l" />
        </div>
      </Group>
    );
  }

  if (isError) {
    return (
      <Group>
        <Placeholder title="Ошибка" action={<Button onClick={onRetry}>Повторить</Button>}>
          Не удалось загрузить данные
        </Placeholder>
      </Group>
    );
  }

  if (notFound) {
    return (
      <Group>
        <Placeholder
          title={`${entityName} не найден`}
          action={<Button onClick={onBack}>Вернуться к списку</Button>}
        >
          Запись могла быть удалена или ссылка устарела
        </Placeholder>
      </Group>
    );
  }

  return null;
};
