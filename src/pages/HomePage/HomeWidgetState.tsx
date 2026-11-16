import type { FC } from 'react';
import { Banner, Button, Spinner } from '@vkontakte/vkui';

interface HomeWidgetStateProps {
  title: string;
  entityLabel: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const HomeWidgetState: FC<HomeWidgetStateProps> = ({
  title,
  entityLabel,
  isLoading,
  isError,
  onRetry,
}) => {
  if (!isLoading && !isError) return null;

  return (
    <Banner
      mode="tint"
      before={isLoading ? <Spinner size="m" /> : undefined}
      title={title}
      subtitle={isError ? `Не удалось загрузить ${entityLabel}` : 'Загрузка…'}
      actions={
        isError ? (
          <Button size="m" mode="secondary" onClick={onRetry}>
            Повторить
          </Button>
        ) : undefined
      }
    />
  );
};
