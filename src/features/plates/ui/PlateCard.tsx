import React from 'react';
import { Tappable } from '@vkontakte/vkui';
import { PlateNumber } from './PlateNumber.tsx';

interface PlateCardProps {
  plate: string;
  name: string;
  onClick?: () => void;
}

export const PlateCard: React.FC<PlateCardProps> = ({ plate, name, onClick }) => {
  const style: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    background: '#18181b',
    borderRadius: 12,
    padding: '7px 7px 0',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
  };

  const content = (
    <>
      <PlateNumber plate={plate} />
      <div style={{ padding: '8px 10px 9px', textAlign: 'center' }}>
        <span
          style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            wordBreak: 'break-word',
            lineHeight: 1.3,
          }}
        >
          {name}
        </span>
      </div>
    </>
  );

  if (!onClick) {
    return <div style={style}>{content}</div>;
  }

  return (
    <Tappable onClick={onClick} hoverMode="opacity" activeMode="opacity" style={style}>
      {content}
    </Tappable>
  );
};
