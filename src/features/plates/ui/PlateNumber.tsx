import React from 'react';
import { parsePlateParts } from '../utils/plateFormat';

interface PlateNumberProps {
  plate: string;
  size?: 's' | 'm' | 'l';
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

const GOST_FONT_FAMILY =
  "'RoadNumbers', ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace";

const LETTERS_FONT_FAMILY = "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const MIXED_DIGIT_STYLE: React.CSSProperties = { fontFamily: GOST_FONT_FAMILY };
const MIXED_LETTER_STYLE: React.CSSProperties = {
  fontFamily: LETTERS_FONT_FAMILY,
  fontWeight: 600,
};

const renderMixedChars = (text: string): React.ReactNode =>
  [...text].map((char, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key
    <span key={index} style={/\d/.test(char) ? MIXED_DIGIT_STYLE : MIXED_LETTER_STYLE}>
      {char}
    </span>
  ));

export const PlateNumber: React.FC<PlateNumberProps> = ({ plate, size = 'm' }) => {
  if (size === 'l') {
    return <PlateNumberLarge plate={plate} />;
  }

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
          fontFamily: GOST_FONT_FAMILY,
          fontSize: s.main,
          fontWeight: 400,
          color: '#0a0a0a',
          whiteSpace: 'nowrap',
        }}
      >
        {renderMixedChars(plate)}
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
          fontFamily: GOST_FONT_FAMILY,
          fontSize: s.main,
          fontWeight: 400,
          color: '#0a0a0a',
          letterSpacing: '0.06em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontFamily: LETTERS_FONT_FAMILY, fontWeight: 600 }}>{parts.left}</span>{' '}
        <span style={{ fontFamily: GOST_FONT_FAMILY }}>{parts.digits}</span>{' '}
        <span style={{ fontFamily: LETTERS_FONT_FAMILY, fontWeight: 600 }}>{parts.right}</span>
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
        <span
          style={{
            fontFamily: GOST_FONT_FAMILY,
            fontSize: s.region,
            fontWeight: 400,
            color: '#0a0a0a',
            lineHeight: 1,
          }}
        >
          {parts.region}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Math.max(2, s.gap - 1),
            lineHeight: 1,
          }}
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
            style={{
              fontFamily: LETTERS_FONT_FAMILY,
              fontSize: s.rus,
              fontWeight: 600,
              color: '#0a0a0a',
              letterSpacing: '0.03em',
            }}
          >
            RUS
          </span>
        </span>
      </div>
    </div>
  );
};

const PlateNumberLarge: React.FC<{ plate: string }> = ({ plate }) => {
  const parts = parsePlateParts(plate);

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '520 / 110',
        containerType: 'inline-size',
        background: '#fff',
        borderRadius: '1.6cqw',
        padding: '1.2cqw',
      }}
    >
      <div
        style={{
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'stretch',
          border: '0.7cqw solid #0a0a0a',
          borderRadius: '0.8cqw',
          overflow: 'hidden',
        }}
      >
        {parts ? (
          <>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2cqw',
                fontSize: '19cqw',
                fontWeight: 400,
                lineHeight: 1,
                color: '#0a0a0a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', columnGap: '2cqw' }}>
                <span
                  style={{ fontFamily: LETTERS_FONT_FAMILY, fontWeight: 600, fontSize: '17cqw' }}
                >
                  {parts.left}
                </span>
                <span style={{ fontFamily: GOST_FONT_FAMILY }}>{parts.digits}</span>
                <span
                  style={{ fontFamily: LETTERS_FONT_FAMILY, fontWeight: 600, fontSize: '17cqw' }}
                >
                  {parts.right}
                </span>
              </div>
            </div>
            <div
              style={{
                flex: '0 0 22cqw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: '0.7cqw solid #0a0a0a',
                padding: '1.8cqw 0.5cqw 1.4cqw',
              }}
            >
              <span
                style={{
                  fontFamily: GOST_FONT_FAMILY,
                  fontSize: '10.5cqw',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: '#0a0a0a',
                }}
              >
                {parts.region}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '1cqw',
                  lineHeight: 1,
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', width: '2.4cqw' }}>
                  <span
                    style={{
                      height: '1.3cqw',
                      boxSizing: 'border-box',
                      background: '#fff',
                      border: '0.3cqw solid rgba(0, 0, 0, 0.45)',
                      borderRadius: '0.2cqw',
                    }}
                  />
                  <span style={{ height: '1.3cqw', background: '#0039A6' }} />
                  <span style={{ height: '1.3cqw', background: '#D52B1E' }} />
                </span>
                <span
                  style={{
                    fontFamily: LETTERS_FONT_FAMILY,
                    fontSize: '3.8cqw',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: '#0a0a0a',
                  }}
                >
                  RUS
                </span>
              </span>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 2cqw',
              fontFamily: GOST_FONT_FAMILY,
              fontSize: '12cqw',
              fontWeight: 400,
              lineHeight: 1,
              color: '#0a0a0a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {renderMixedChars(plate)}
          </div>
        )}
      </div>
    </div>
  );
};
