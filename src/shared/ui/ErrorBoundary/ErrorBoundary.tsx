import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Group, Placeholder } from '@vkontakte/vkui';

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка рендера приложения', error, info);
  }

  private retry = (): void => {
    if (!this.props.onRetry) {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Group>
          <Placeholder
            title="Что-то пошло не так"
            action={<Button onClick={this.retry}>Попробовать снова</Button>}
          >
            Попробуйте ещё раз или перезапустите мини-приложение
          </Placeholder>
        </Group>
      );
    }

    return this.props.children;
  }
}
