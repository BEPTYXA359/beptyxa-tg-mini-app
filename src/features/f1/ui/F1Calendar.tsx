import {
  Button,
  Group,
  Header,
  HorizontalScroll,
  Placeholder,
  Spinner,
  Tabs,
  TabsItem,
} from '@vkontakte/vkui';
import { useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { F1GrandPrix, F1Overview, F1ResultEntry } from '../model/f1.types';
import { useGetF1GrandPrix } from '../hooks/useGetF1GrandPrix';
import {
  countryFlag,
  formatMskDateTime,
  formatResultCell,
  getResultColumns,
} from '../utils/f1-format';
import { F1Table } from './F1Table';

interface F1CalendarProps {
  overview: F1Overview;
  chatId?: number;
}

type GrandPrixSession = F1GrandPrix['sessions'][number];

const GP_PANEL_ID = 'f1-gp-panel';
const SESSION_PANEL_ID = 'f1-session-panel';

const getProtocolSessions = (grandPrix: F1GrandPrix): GrandPrixSession[] => {
  const qualifying = grandPrix.sessions.find((session) => session.kind === 'qualifying');
  const sprint = grandPrix.sessions.find((session) => session.kind === 'sprint');
  const race = grandPrix.sessions.find((session) => session.kind === 'race');

  return [qualifying, sprint, race].filter((session): session is GrandPrixSession =>
    Boolean(session?.results),
  );
};

const DriverCell = ({ entry }: { entry: F1ResultEntry }) => (
  <div className="f1-driver-cell">
    <span>{entry.driverNameRu}</span>
    <span>
      {[
        entry.constructorNameRu,
        entry.driverNumber ? `#${entry.driverNumber}` : null,
        entry.dnf ? entry.status : null,
      ]
        .filter(Boolean)
        .join(' · ')}
    </span>
  </div>
);

export const F1Calendar = ({ overview, chatId }: F1CalendarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRound = Number(searchParams.get('round'));
  const selectedRound = overview.rounds.some((round) => round.round === requestedRound)
    ? requestedRound
    : (overview.lastCompletedGp ??
      overview.nextSession?.round ??
      overview.rounds[0]?.round ??
      null);
  const { data: grandPrix, isLoading, isError, refetch } = useGetF1GrandPrix(selectedRound, chatId);
  const selectedTabRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    selectedTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [selectedRound]);

  if (selectedRound === null) {
    return <Placeholder title="Нет этапов">Календарь сезона пока пуст.</Placeholder>;
  }

  return (
    <>
      <HorizontalScroll className="f1-gp-tabs" scrollOnAnyWheel>
        <Tabs
          aria-label="Гран-при сезона"
          selectedId={String(selectedRound)}
          onSelectedIdChange={(id) => setSearchParams({ round: id })}
        >
          {overview.rounds.map((round) => (
            <TabsItem
              key={round.round}
              id={String(round.round)}
              aria-controls={GP_PANEL_ID}
              getRootRef={round.round === selectedRound ? selectedTabRef : undefined}
            >
              {round.raceNameRu ?? round.raceName}
            </TabsItem>
          ))}
        </Tabs>
      </HorizontalScroll>

      {isLoading && (
        <div className="f1-loader">
          <Spinner size="l" />
        </div>
      )}
      {isError && (
        <Group>
          <Placeholder
            title="Ошибка"
            action={<Button onClick={() => void refetch()}>Повторить</Button>}
          >
            Не удалось загрузить протоколы Гран-при
          </Placeholder>
        </Group>
      )}
      {grandPrix && <GrandPrixDetails grandPrix={grandPrix} />}
    </>
  );
};

const GrandPrixDetails = ({ grandPrix }: { grandPrix: F1GrandPrix }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const protocolSessions = getProtocolSessions(grandPrix);
  const requestedSession = searchParams.get('session');
  const selectedSession =
    protocolSessions.find((session) => session.kind === requestedSession) ??
    protocolSessions.at(-1);
  const race = grandPrix.sessions.find((session) => session.kind === 'race');
  const raceStartsAt = race?.startsAt ?? grandPrix.sessions.at(-1)?.startsAt;
  const country = [countryFlag(grandPrix.countryCode), grandPrix.countryRu ?? grandPrix.country]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="f1-gp-details"
      id={GP_PANEL_ID}
      role="tabpanel"
      tabIndex={0}
      aria-label={grandPrix.raceNameRu ?? grandPrix.raceName}
    >
      <Group mode="card" header={<Header>Информация о гонке</Header>}>
        <dl className="f1-gp-info">
          {raceStartsAt && (
            <div>
              <dt>Дата</dt>
              <dd>{formatMskDateTime(raceStartsAt)} МСК</dd>
            </div>
          )}
          <div>
            <dt>Трасса</dt>
            <dd>{grandPrix.circuitNameRu ?? grandPrix.circuitName}</dd>
          </div>
          <div>
            <dt>Страна</dt>
            <dd>{country}</dd>
          </div>
        </dl>
      </Group>

      <Group mode="card" header={<Header>{selectedSession?.label ?? 'Результаты'}</Header>}>
        {selectedSession ? (
          <>
            <Tabs
              aria-label="Сессии с результатами"
              selectedId={selectedSession.kind}
              onSelectedIdChange={(kind) =>
                setSearchParams({ round: String(grandPrix.round), session: kind })
              }
              layoutFillMode="shrinked"
            >
              {protocolSessions.map((session) => (
                <TabsItem key={session.id} id={session.kind} aria-controls={SESSION_PANEL_ID}>
                  {session.label}
                </TabsItem>
              ))}
            </Tabs>
            <div id={SESSION_PANEL_ID}>
              <F1Table
                label={`Протокол: ${selectedSession.label}`}
                columns={getResultColumns(selectedSession.kind)}
                rows={selectedSession.results ?? []}
                rowKey={(row) => `${row.driverId ?? row.driverName}-${row.positionText}`}
                cell={(row, key) =>
                  key === 'driver' ? <DriverCell entry={row} /> : formatResultCell(row, key)
                }
              />
            </div>
          </>
        ) : (
          <div className="f1-empty-protocol">Протоколы появятся после завершения сессий.</div>
        )}
      </Group>
    </div>
  );
};
