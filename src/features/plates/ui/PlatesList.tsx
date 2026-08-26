import React, { useMemo, useState } from 'react';
import { Button, Group, Header, IconButton, Placeholder, Search, SimpleCell } from '@vkontakte/vkui';
import { Trash } from 'lucide-react';
import type { Plate } from '../model/plates.types.ts';
import { normalizePlate } from '../utils/plateFormat.ts';
import { PlateNumber } from './PlateNumber.tsx';

interface PlatesListProps {
  items: Plate[];
  onDelete: (id: string) => void;
  onEdit: (item: Plate) => void;
  onCreate: () => void;
}

const formatAuthor = (item: Plate): string =>
  `Добавил: ${item.creatorFirstName}${item.creatorUsername ? ` (@${item.creatorUsername})` : ''}`;

export const PlatesList: React.FC<PlatesListProps> = ({ items, onDelete, onEdit, onCreate }) => {
  const [query, setQuery] = useState('');

  // запрос нормализуем тем же правилом, что и номер: латиница-двойник и регистр не мешают поиску
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
      <Group mode="card" header={<Header>Сохранённые номера</Header>}>
        {filtered.length === 0 ? (
          <Placeholder title="Ничего не найдено">Попробуйте изменить запрос</Placeholder>
        ) : (
          filtered.map((item) => (
            <SimpleCell
              key={item._id}
              before={<PlateNumber plate={item.plate} size="m" />}
              subtitle={formatAuthor(item)}
              after={
                <IconButton
                  label="Удалить номер"
                  style={{ width: 36, height: 36, flex: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item._id);
                  }}
                >
                  <Trash size={20} color="var(--vkui--color_icon_negative)" />
                </IconButton>
              }
              multiline
              onClick={() => onEdit(item)}
            >
              {item.name}
            </SimpleCell>
          ))
        )}
      </Group>
    </>
  );
};
