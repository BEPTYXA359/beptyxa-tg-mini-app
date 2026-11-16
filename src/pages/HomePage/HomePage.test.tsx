import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock('@/shared/api/api.client', () => ({
  apiClient: { get: apiGet, post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/shared/utils/telegram.util', () => ({ getChatId: () => 1 }));
vi.mock('@/shared/hooks/useTelegramBackButton', () => ({
  useTelegramBackButton: () => undefined,
}));

const renderHome = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  apiGet.mockReset();
  apiGet.mockResolvedValue({ data: [] });
});

describe('HomePage query states', () => {
  it('does not present loading reminders as an empty list', () => {
    apiGet.mockImplementation((url) =>
      url === '/reminders' ? new Promise(() => undefined) : Promise.resolve({ data: [] }),
    );
    renderHome();

    expect(screen.queryByText('Нет активных напоминаний')).not.toBeInTheDocument();
    expect(screen.getByText('Конвертер')).toBeInTheDocument();
  });

  it('shows a reminder error and retries only the failed request', async () => {
    apiGet.mockImplementation((url) =>
      url === '/reminders'
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve({ data: [] }),
    );
    const user = userEvent.setup();
    renderHome();

    expect(await screen.findByText('Не удалось загрузить напоминания')).toBeInTheDocument();
    expect(screen.queryByText('Нет активных напоминаний')).not.toBeInTheDocument();
    expect(screen.getByText('Номера не сохранены')).toBeInTheDocument();
    expect(screen.getByText('Конвертер')).toBeInTheDocument();

    apiGet.mockResolvedValue({ data: [] });
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    await waitFor(() => expect(screen.getByText('Нет активных напоминаний')).toBeInTheDocument());
    expect(screen.queryByText('Не удалось загрузить напоминания')).not.toBeInTheDocument();
  });
});
