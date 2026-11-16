import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackProvider } from '@/shared/ui/Feedback/FeedbackProvider';
import { PlateFormPage } from './PlateFormPage/PlateFormPage';
import { ReminderFormPage } from './ReminderFormPage/ReminderFormPage';
import { SubscriptionFormPage } from './SubscriptionFormPage/SubscriptionFormPage';

const { apiGet, apiPost, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock('@/shared/api/api.client', () => ({
  apiClient: { get: apiGet, post: apiPost, put: apiPut, delete: vi.fn() },
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

const reminder = {
  _id: 'reminder-1',
  chatId: 1,
  createdBy: 1,
  creatorFirstName: 'User',
  message: 'Позвонить другу',
  frequency: 'daily' as const,
  time: '09:00',
  timezone: 'Europe/Moscow',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const subscription = {
  _id: 'subscription-1',
  chatId: 1,
  name: 'Netflix',
  cost: 9.99,
  currency: 'USD',
  period: 'month' as const,
  nextPaymentDate: '2027-01-01',
  remindDaysBefore: 1,
  notificationsEnabled: true,
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 1,
  creatorFirstName: 'User',
};

const renderPage = (initialPath: string, basePath: string, page: ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path={`${basePath}/new`} element={page} />
            <Route path={`${basePath}/:id/edit`} element={page} />
            <Route path={basePath} element={<div>{basePath} list</div>} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiPost.mockResolvedValue({ data: {} });
  apiPut.mockResolvedValue({ data: {} });
});

describe('entity form routes', () => {
  it('loads a plate from a direct edit URL and updates it with PUT', async () => {
    apiGet.mockResolvedValue({ data: [plate] });
    const user = userEvent.setup();
    renderPage('/plates/plate-1/edit', '/plates', <PlateFormPage />);

    expect(await screen.findByDisplayValue('А123ВС77')).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Витя');
    await user.clear(nameInput);
    await user.type(nameInput, 'Петя');
    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith(
        '/car-plates/plate-1',
        { plate: 'А123ВС77', name: 'Петя' },
        { params: { chatId: 1 } },
      );
    });
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('loads a reminder from a direct edit URL', async () => {
    apiGet.mockResolvedValue({ data: [reminder] });
    renderPage('/reminders/reminder-1/edit', '/reminders', <ReminderFormPage />);

    expect(await screen.findByDisplayValue('Позвонить другу')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
  });

  it('loads a subscription from a direct edit URL', async () => {
    apiGet.mockResolvedValue({ data: [subscription] });
    renderPage('/subscriptions/subscription-1/edit', '/subscriptions', <SubscriptionFormPage />);

    expect(await screen.findByDisplayValue('Netflix')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9.99')).toBeInTheDocument();
  });

  it('shows not found for an unknown edit id', async () => {
    apiGet.mockResolvedValue({ data: [] });
    renderPage('/plates/missing/edit', '/plates', <PlateFormPage />);

    expect(await screen.findByText('Номер не найден')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Добавить' })).not.toBeInTheDocument();
  });

  it('moves focus to the first invalid field', async () => {
    apiGet.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderPage('/plates/new', '/plates', <PlateFormPage />);

    const plateInput = screen.getByPlaceholderText('А123ВС77');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByText('Введите номер автомобиля')).toBeInTheDocument();
    expect(plateInput).toHaveFocus();
  });

  it('keeps create mode on the new URL', async () => {
    apiGet.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderPage('/plates/new', '/plates', <PlateFormPage />);

    await user.type(screen.getByPlaceholderText('А123ВС77'), 'А123ВС77');
    await user.type(screen.getByPlaceholderText('Например, Витя'), 'Витя');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(
        '/car-plates',
        { plate: 'А123ВС77', name: 'Витя' },
        { params: { chatId: 1 } },
      );
    });
    expect(apiPut).not.toHaveBeenCalled();
  });

  it('preserves the saved timezone when editing a recurring reminder', async () => {
    apiGet.mockResolvedValue({
      data: [{ ...reminder, timezone: 'America/New_York' }],
    });
    const user = userEvent.setup();
    renderPage('/reminders/reminder-1/edit', '/reminders', <ReminderFormPage />);

    expect(await screen.findByDisplayValue('Позвонить другу')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith(
        '/reminders/reminder-1',
        expect.objectContaining({ timezone: 'America/New_York', time: '09:00' }),
        { params: { chatId: 1 } },
      );
    });
  });

  it('keeps the UTC default when editing a legacy recurring reminder', async () => {
    apiGet.mockResolvedValue({
      data: [{ ...reminder, timezone: undefined }],
    });
    const user = userEvent.setup();
    renderPage('/reminders/reminder-1/edit', '/reminders', <ReminderFormPage />);

    expect(await screen.findByDisplayValue('Позвонить другу')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith(
        '/reminders/reminder-1',
        expect.objectContaining({ timezone: 'UTC', time: '09:00' }),
        { params: { chatId: 1 } },
      );
    });
  });
});
