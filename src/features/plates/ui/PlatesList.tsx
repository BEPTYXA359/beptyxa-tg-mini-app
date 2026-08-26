import React, { useMemo, useState } from 'react';
import { Button, Group, Header, Placeholder, Search } from '@vkontakte/vkui';
import type { Plate } from '../model/plates.types.ts';
import { normalizePlate } from '../utils/plateFormat.ts';
import { PlateCard } from './PlateCard.tsx';

interface PlatesListProps {
  items: Plate[];
  onEdit: (item: Plate) => void;
  onCreate: () => void;
}

export const PlatesList: React.FC<PlatesListProps> = ({ items, onEdit, onCreate }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items;
    const normalizedQuery = normalizePlate(trimmed);
    const lowerQuery = trimmed.toLowerCase();
    return items.filter(
      (item) => item.plate.includes(normalizedQuery) || item.name.toLowerCase().includes(lowerQuery),
    );
  }, [items, query]);

  if (items.length === 0) {
    return (
      <Group mode="card">
        <Placeholder
          title="Пока нет номеров"
          action={
            <Button size="m" onClick={onCreate}>
              Добавить номер
            </Button>
          }
        >
          Сохраняйте номера машин и имена владельцев для этого чата
        </Placeholder>
      </Group>
    );
  }

  return (
    <>
      <Search value={query} onChange={(e) => setQuery(e.target.value)} after={null} />
      <Header>Сохранённые номера</Header>
      {filtered.length === 0 ? (
        <Group mode="card">
          <Placeholder title="Ничего не найдено">Попробуйте изменить запрос</Placeholder>
        </Group>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item) => (
            <PlateCard
              key={item._id}
              plate={item.plate}
              name={item.name}
              onClick={() => onEdit(item)}
            />
          ))}
        </div>
      )}
    </>
  );
};
