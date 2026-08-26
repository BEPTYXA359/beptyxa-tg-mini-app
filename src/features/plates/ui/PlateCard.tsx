import React from 'react';
import { Tappable } from '@vkontakte/vkui';
import { PlateNumber } from './PlateNumber.tsx';

interface PlateCardProps {
  plate: string;
  name: string;
  onClick: () => void;
}

// «Автомобильная рамка»: табличка крупно, а имя владельца — отцентрировано
// на утолщённой нижней полосе рамки, как надпись на настоящей рамке номера
export const PlateCard: React.FC<PlateCardProps> = ({ plate, name, onClick }) => (
  <Tappable
    onClick={onClick}
    style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      border: '3px solid var(--vkui--color_separator_primary)',
      borderBottom: '6px solid var(--vkui--color_separator_primary)',
      borderRadius: 14,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '14px 14px 10px',
      }}
    >
      <PlateNumber plate={plate} size="l" />
    </div>
    <div
      style={{
        borderTop: '3px solid var(--vkui--color_separator_primary)',
        padding: '7px 16px 9px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: 'var(--vkui--color_text_primary)',
          wordBreak: 'break-word',
        }}
      >
        {name}
      </span>
    </div>
  </Tappable>
);
