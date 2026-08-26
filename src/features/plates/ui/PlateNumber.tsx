import React from 'react';
import { parsePlateParts } from '../utils/plateFormat';

interface PlateNumberProps {
  plate: string;
  size?: 's' | 'm';
}

interface PlateNumberSize {
  main: number;
  region: number;
  rus: number;
  border: number;
  radius: number;
  padX: number;
  padY: number;
  gap: number;
  stripeWidth: number;
  stripeHeight: number;
}

const SIZES: Record<'s' | 'm', PlateNumberSize> = {
  s: {
    main: 13,
    region: 9,
    rus: 5,
    border: 2,
    radius: 6,
    padX: 6,
    padY: 4,
    gap: 3,
    stripeWidth: 7,
    stripeHeight: 2,
  },
  m: {
    main: 19,
    region: 13,
    rus: 7,
    border: 3,
    radius: 8,
    padX: 10,
    padY: 6,
    gap: 4,
    stripeWidth: 11,
    stripeHeight: 3,
  },
};

// Табличка всегда светлая с чёрными символами — как настоящий номер, независимо от темы мини-аппа
export const PlateNumber: React.FC<PlateNumberProps> = ({ plate, size = 'm' }) => {
  const parts = parsePlateParts(plate);
  const s = SIZES[size];

  if (!parts) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          flex: 'none',
          background: '#fff',
          border: `${s.border}px solid #0a0a0a`,
          borderRadius: s.radius,
          padding: `${s.padY}px ${s.padX}px`,
          fontSize: s.main,
          fontWeight: 700,
          color: '#0a0a0a',
          whiteSpace: 'nowrap',
        }}
      >
        {plate}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        flex: 'none',
        background: '#fff',
        border: `${s.border}px solid #0a0a0a`,
        borderRadius: s.radius,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${s.padY}px ${s.padX}px`,
          fontSize: s.main,
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '0.06em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {parts.left} {parts.digits} {parts.right}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s.gap,
          padding: `${s.padY}px ${Math.max(3, s.padX - 3)}px`,
          borderLeft: `${s.border}px solid #0a0a0a`,
        }}
      >
        <span style={{ fontSize: s.region, fontWeight: 700, color: '#0a0a0a', lineHeight: 1 }}>
          {parts.region}
        </span>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: Math.max(2, s.gap - 1), lineHeight: 1 }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', width: s.stripeWidth }}>
            <span
              style={{
                height: s.stripeHeight,
                background: '#fff',
                border: '1px solid rgba(0, 0, 0, 0.4)',
                borderRadius: 1,
              }}
            />
            <span style={{ height: s.stripeHeight, background: '#0039A6' }} />
            <span style={{ height: s.stripeHeight, background: '#D52B1E' }} />
          </span>
          <span
            style={{ fontSize: s.rus, fontWeight: 700, color: '#0a0a0a', letterSpacing: '0.03em' }}
          >
            RUS
          </span>
        </span>
      </div>
    </div>
  );
};
