import { Group, Header, Placeholder } from '@vkontakte/vkui';
import type { F1StandingEntry, F1StandingsSnapshot } from '../model/f1.types';
import { formatPointsDelta, formatPositionDelta } from '../utils/f1-format';
import { F1Table } from './F1Table';

const columns = [
  { key: 'position', label: '#' },
  { key: 'delta', label: 'Δ' },
  { key: 'name', label: 'Участник' },
  { key: 'points', label: 'Очки' },
  { key: 'pointsDelta', label: '± очки' },
];

const StandingsTable = ({ title, rows }: { title: string; rows: F1StandingEntry[] }) => (
  <Group mode="card" header={<Header>{title}</Header>}>
    <F1Table
      label={title}
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      cell={(row, key) => {
        if (key === 'position') return row.position;
        if (key === 'delta') return formatPositionDelta(row.positionDelta);
        if (key === 'name') return row.nameRu;
        if (key === 'points') return row.points;
        return formatPointsDelta(row.pointsDelta);
      }}
    />
  </Group>
);

export const F1Standings = ({ standings }: { standings: F1StandingsSnapshot | null }) => {
  if (!standings) {
    return (
      <Placeholder title="Кубок пока недоступен">
        Результаты появятся после первого этапа.
      </Placeholder>
    );
  }
  return (
    <>
      <StandingsTable title="Кубок пилотов" rows={standings.drivers} />
      <StandingsTable title="Кубок конструкторов" rows={standings.constructors} />
    </>
  );
};
