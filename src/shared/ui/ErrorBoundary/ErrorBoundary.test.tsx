import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;
const Problem = () => {
  if (shouldThrow) throw new Error('Render failed');
  return <div>Восстановлено</div>;
};

beforeEach(() => {
  shouldThrow = true;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('ErrorBoundary', () => {
  it('shows a fallback and invokes the retry handler', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn(() => {
      shouldThrow = false;
    });
    render(
      <ErrorBoundary onRetry={onRetry}>
        <Problem />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText('Восстановлено')).toBeInTheDocument();
  });
});
