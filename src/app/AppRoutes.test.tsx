import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackProvider } from '@/shared/ui/Feedback/FeedbackProvider';
import { AppRoutes } from './AppRoutes';

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock('@/shared/api/api.client', () => ({
  apiClient: { get: apiGet, post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/shared/utils/telegram.util', () => ({ getChatId: () => 1 }));
vi.mock('@/shared/hooks/useTelegramBackButton', () => ({
  useTelegramBackButton: () => undefined,
}));

const plate = {
  _id: 'plate-1',
  chatId: 1,
  plate: 'А123ВС77',
  name: 'Витя',
  format: 'ru' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 1,
  creatorFirstName: 'User',
};

const renderRoute = (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </FeedbackProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  apiGet.mockReset();
  apiGet.mockResolvedValue({ data: [plate] });
});

describe('AppRoutes', () => {
  it('opens the plate editor at its persistent URL', async () => {
    renderRoute('/plates/plate-1/edit');

    expect(await screen.findByDisplayValue('А123ВС77')).toBeInTheDocument();
  });

  it('shows a not-found page for an unknown route', async () => {
    renderRoute('/does-not-exist');

    expect(await screen.findByText('Страница не найдена')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'На главную' })).toBeInTheDocument();
  });

  it('redirects the legacy plate form URL to create mode', async () => {
    renderRoute('/plates/form');

    expect(await screen.findByRole('button', { name: 'Добавить' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('А123ВС77')).not.toBeInTheDocument();
  });
});
