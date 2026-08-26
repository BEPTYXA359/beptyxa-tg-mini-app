import React, { useMemo } from 'react';
import { Avatar, Banner } from '@vkontakte/vkui';
import { Car } from 'lucide-react';
import type { Plate } from '../model/plates.types.ts';
import { haptic } from '@/shared/utils/haptic.util';

interface PlatesWidgetProps {
  onClick: () => void;
  // список приходит с бэкенда отсортированным по дате создания, поэтому первый элемент — последний добавленный
  plates: Plate[];
}

export const PlatesWidget: React.FC<PlatesWidgetProps> = ({ onClick, plates }) => {
  const { count, subtitle } = useMemo(() => {
    const latest = plates[0];
    if (!latest) return { count: 0, subtitle: 'Номера не сохранены' };
    return { count: plates.length, subtitle: `Последний: ${latest.plate} · ${latest.name}` };
  }, [plates]);

  return (
    <Banner
      mode="tint"
      before={
        <Avatar size={40} style={{ background: 'var(--vkui--color_background_accent)' }}>
          <Car size={20} color="var(--vkui--color_background_contrast)" />
        </Avatar>
      }
      title={count > 0 ? `Номера · ${count}` : 'Номера'}
      subtitle={subtitle}
      after="chevron"
      onClick={() => {
        haptic.impact('light');
        onClick();
      }}
    />
  );
};
