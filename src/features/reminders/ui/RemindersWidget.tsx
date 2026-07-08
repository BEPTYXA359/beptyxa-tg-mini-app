import React from 'react';
import { Card } from '@telegram-apps/telegram-ui';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';
import { ArrowRightToLine, BellRing } from 'lucide-react';

interface RemindersWidgetProps {
  onClick: () => void;
  activeCount: number;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ onClick, activeCount }) => {
  return (
    <Card style={{ width: '100%' }}>
      <CardCell
        before={<BellRing color="var(--tgui--hint_color)" />}
        subtitle={activeCount > 0 ? `Активных задач: ${activeCount}` : 'Нет активных задач'}
        after={<ArrowRightToLine color="var(--tgui--hint_color)" />}
        onClick={onClick}
      >
        Напоминания
      </CardCell>
    </Card>
  );
};
