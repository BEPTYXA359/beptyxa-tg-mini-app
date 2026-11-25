import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { F1GrandPrix, F1Overview, F1Settings } from '@/features/f1/model/f1.types';
import { F1Page } from './F1Page';

const { apiGet, apiPut, effectiveChatId } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  effectiveChatId: { value: 1 as number | undefined },
}));

vi.mock('@/shared/api/api.client', () => ({
  apiClient: { get: apiGet, post: vi.fn(), put: apiPut, delete: vi.fn() },
}));
vi.mock('@/shared/utils/telegram.util', () => ({
  getEffectiveChatId: () => effectiveChatId.value,
}));
vi.mock('@/shared/hooks/useTelegramBackButton', () => ({
  useTelegramBackButton: () => undefined,
}));

const overview: F1Overview = {
  season: 2026,
  rounds: [
    {
      round: 1,
      raceName: 'Australian Grand Prix',
      country: 'Australia',
      circuitName: 'Albert Park',
      startsAt: '2026-03-08T04:00:00.000Z',
      status: 'completed',
    },
    {
      round: 2,
      raceName: 'Chinese Grand Prix',
      raceNameRu: 'Гран-при Китая',
      country: 'China',
      countryRu: 'Китай',
      countryCode: 'CN',
      circuitName: 'Shanghai International Circuit',
      startsAt: '2026-03-15T07:00:00.000Z',
      status: 'next',
    },
    {
      round: 3,
      raceName: 'Japanese Grand Prix',
      country: 'Japan',
      circuitName: 'Suzuka',
      startsAt: '2026-03-29T05:00:00.000Z',
      status: 'upcoming',
    },
  ],
  standings: {
    sessionId: '2026-1-race',
    capturedAt: '2026-03-08T06:00:00.000Z',
    drivers: [
      {
        id: 'norris',
        name: 'Lando Norris',
        nameRu: 'Ландо Норрис',
        position: 1,
        previousPosition: 2,
        positionDelta: 1,
        points: 25,
        pointsDelta: 25,
      },
    ],
    constructors: [
      {
        id: 'mclaren',
        name: 'McLaren',
        nameRu: 'Макларен',
        position: 1,
        previousPosition: 1,
        positionDelta: 0,
        points: 25,
        pointsDelta: 25,
      },
    ],
  },
  lastCompletedGp: 1,
  nextSession: {
    id: '2026-2-race',
    season: 2026,
    round: 2,
    kind: 'race',
    label: 'Гонка',
    startsAt: '2026-03-15T07:00:00.000Z',
    expectedEnd: '2026-03-15T09:00:00.000Z',
  },
};

const firstGp: F1GrandPrix = {
  season: 2026,
  round: 1,
  raceName: 'Australian Grand Prix',
  country: 'Australia',
  circuitName: 'Albert Park',
  sessions: [
    {
      id: '2026-1-qualifying',
      season: 2026,
      round: 1,
      kind: 'qualifying',
      label: 'Квалификация',
      startsAt: '2026-03-07T05:00:00.000Z',
      expectedEnd: '2026-03-07T06:00:00.000Z',
      results: [
        {
          position: 1,
          positionText: '1',
          driverName: 'Lando Norris',
          driverNameRu: 'Ландо Норрис',
          constructorName: 'McLaren',
          constructorNameRu: 'Макларен',
          segments: ['1:20.000', '1:19.500', '1:19.000'],
          dnf: false,
        },
      ],
    },
    {
      id: '2026-1-sprint',
      season: 2026,
      round: 1,
      kind: 'sprint',
      label: 'Спринт',
      startsAt: '2026-03-07T09:00:00.000Z',
      expectedEnd: '2026-03-07T10:00:00.000Z',
      results: [
        {
          position: 1,
          positionText: '1',
          driverName: 'Oscar Piastri',
          driverNameRu: 'Оскар Пиастри',
          constructorName: 'McLaren',
          constructorNameRu: 'Макларен',
          time: '30:45.123',
          laps: 19,
          points: 8,
          status: 'Finished',
          dnf: false,
        },
      ],
    },
    {
      id: '2026-1-race',
      season: 2026,
      round: 1,
      kind: 'race',
      label: 'Гонка',
      startsAt: '2026-03-08T04:00:00.000Z',
      expectedEnd: '2026-03-08T06:00:00.000Z',
      results: [
        {
          position: 1,
          positionText: '1',
          driverName: 'Lando Norris',
          driverNameRu: 'Ландо Норрис',
          constructorName: 'McLaren',
          constructorNameRu: 'Макларен',
          time: '1:30:00.000',
          laps: 58,
          points: 25,
          status: 'Finished',
          dnf: false,
        },
        {
          position: null,
          positionText: 'NC',
          driverName: 'Oscar Piastri',
          driverNameRu: 'Оскар Пиастри',
          constructorName: 'McLaren',
          constructorNameRu: 'Макларен',
          laps: 12,
          status: 'Engine',
          dnf: true,
        },
      ],
    },
  ],
};

const secondGp: F1GrandPrix = {
  ...firstGp,
  round: 2,
  raceName: 'Chinese Grand Prix',
  raceNameRu: 'Гран-при Китая',
  country: 'China',
  countryRu: 'Китай',
  countryCode: 'CN',
  circuitName: 'Shanghai International Circuit',
  circuitNameRu: 'Шанхай',
  // уик-энд в разгаре: квалификация проведена, спринт и гонка ещё не состоялись
  sessions: firstGp.sessions.map((session) => ({
    ...session,
    id: session.id.replace('-1-', '-2-'),
    round: 2,
    results: session.kind === 'race' || session.kind === 'sprint' ? null : session.results,
  })),
};

const thirdGp: F1GrandPrix = {
  ...firstGp,
  round: 3,
  raceName: 'Japanese Grand Prix',
  country: 'Japan',
  circuitName: 'Suzuka',
  sessions: [
    {
      ...firstGp.sessions[0],
      id: '2026-3-practice1',
      kind: 'practice1',
      label: 'Практика 1',
      results: null,
    },
    { ...firstGp.sessions[0], id: '2026-3-qualifying', results: null },
    { ...firstGp.sessions[2], id: '2026-3-race', results: null },
  ],
};

const settings: F1Settings = {
  enabled: false,
  fullProtocols: false,
  reminders: [],
};

const renderPage = (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/f1/:tab?" element={<F1Page />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset();
  effectiveChatId.value = 1;
  apiGet.mockImplementation((url: string) => {
    if (url === '/f1/overview') return Promise.resolve({ data: overview });
    if (url === '/f1/gp/1') return Promise.resolve({ data: firstGp });
    if (url === '/f1/gp/2') return Promise.resolve({ data: secondGp });
    if (url === '/f1/gp/3') return Promise.resolve({ data: thirdGp });
    if (url === '/f1/settings/1') return Promise.resolve({ data: settings });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  apiPut.mockResolvedValue({
    data: { enabled: true, fullProtocols: false, reminders: [30] },
  });
});

describe('F1Page', () => {
  it('показывает русские названия этапа и трассы и флаг страны из API', async () => {
    renderPage('/f1/calendar?round=2');

    expect(await screen.findByText('1:19.000')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Гран-при Китая' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Шанхай')).toBeInTheDocument();
    expect(screen.getByText('🇨🇳 Китай')).toBeInTheDocument();
  });

  it('связывает вкладки Гран-при с панелью протокола для скринридеров', async () => {
    renderPage('/f1/calendar?round=1');

    expect(await screen.findByText('Оскар Пиастри')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'f1-gp-panel');
    expect(screen.getByRole('tab', { name: 'Australian Grand Prix' })).toHaveAttribute(
      'aria-controls',
      'f1-gp-panel',
    );
  });

  it('настройки доступны, даже если обзор сезона не загрузился', async () => {
    apiGet.mockImplementation((url: string) =>
      url === '/f1/overview'
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve({ data: settings }),
    );
    renderPage('/f1/settings');

    expect(
      await screen.findByRole('switch', { name: 'Получать результаты Ф1' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Настройки' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows three sections and the race protocol directly in the calendar', async () => {
    renderPage('/f1/calendar?round=1');

    expect(await screen.findByText('Оскар Пиастри')).toBeInTheDocument();
    expect(screen.getByText(/Albert Park/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Календарь' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Кубок' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Результаты' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Настройки' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Australian Grand Prix' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByText(/08\.03\.2026, 07:00/).length).toBeGreaterThan(0);
    expect(screen.getByText('DNF')).toBeInTheDocument();
    expect(screen.getByText(/Engine/)).toBeInTheDocument();
    expect(screen.queryByText('Опубликован')).not.toBeInTheDocument();
    expect(screen.queryByText('Ожидается')).not.toBeInTheDocument();
  });

  it('shows the sprint protocol alongside qualifying and race', async () => {
    renderPage('/f1/calendar?round=1&session=sprint');

    expect(await screen.findByText('30:45.123')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Спринт' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Квалификация' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Гонка' })).toBeInTheDocument();
  });

  it('falls back to qualifying and switches between grand prix and sessions', async () => {
    const user = userEvent.setup();
    renderPage('/f1/calendar?round=2');

    expect(await screen.findByText('1:19.000')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Гонка' })).not.toBeInTheDocument();
    expect(screen.queryByText('Оскар Пиастри')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Australian Grand Prix' }));
    await waitFor(() => expect(apiGet).toHaveBeenCalledWith('/f1/gp/1', expect.anything()));
    expect(await screen.findByText('Оскар Пиастри')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Квалификация' }));

    expect(await screen.findByText('1:19.000')).toBeInTheDocument();
    expect(screen.queryByText('Оскар Пиастри')).not.toBeInTheDocument();
  });

  it('scrolls the selected grand prix into view on initial render', async () => {
    const scrollIntoView = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    renderPage('/f1/calendar?round=2');

    expect(await screen.findByText('1:19.000')).toBeInTheDocument();
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center' }),
    );
  });

  it('показывает заглушку, пока протоколы сессий не опубликованы', async () => {
    renderPage('/f1/calendar?round=3');

    expect(
      await screen.findByText('Протоколы появятся после завершения сессий.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Гонка' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Квалификация' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Практика/ })).not.toBeInTheDocument();
  });

  it('retries a failed overview request', async () => {
    const user = userEvent.setup();
    apiGet.mockImplementation((url: string) =>
      url === '/f1/overview'
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve({ data: settings }),
    );
    renderPage('/f1/calendar');

    expect(await screen.findByText('Не удалось загрузить данные Ф1')).toBeInTheDocument();
    apiGet.mockImplementation((url: string) => {
      if (url === '/f1/overview') return Promise.resolve({ data: overview });
      if (url === '/f1/gp/1') return Promise.resolve({ data: firstGp });
      return Promise.resolve({ data: settings });
    });
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByText(/Albert Park/)).toBeInTheDocument();
  });

  it('saves subscription toggles and reminder intervals for the effective chat', async () => {
    const user = userEvent.setup();
    effectiveChatId.value = 42;
    apiGet.mockImplementation((url: string) => {
      if (url === '/f1/overview') return Promise.resolve({ data: overview });
      if (url === '/f1/settings/42') return Promise.resolve({ data: settings });
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    renderPage('/f1/settings');

    const enabled = await screen.findByRole('switch', { name: 'Получать результаты Ф1' });
    expect(enabled).not.toBeChecked();
    expect(screen.queryByRole('switch', { name: 'Результаты практик' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
    await user.click(enabled);
    await user.click(screen.getByRole('button', { name: '30 минут' }));
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith('/f1/settings/42', {
        enabled: true,
        fullProtocols: false,
        reminders: [30],
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Настройки сохранены');
  });
});
