import React from 'react';
import { parsePartialPlate } from '../utils/plateFormat';

const GOST_FONT_FAMILY =
  "'RoadNumbers', ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace";

const LETTERS_FONT_FAMILY = "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export const PlateNumber: React.FC<{ plate: string }> = ({ plate }) => {
  const parts = parsePartialPlate(plate);

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '520 / 110',
        containerType: 'inline-size',
        background: '#fff',
        borderRadius: '1.6cqw',
      }}
    >
      <div
        style={{
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            padding: '0 2cqw',
            fontSize: '25cqw',
            fontWeight: 400,
            lineHeight: 1,
            color: '#0a0a0a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'end', letterSpacing: '1.5cqw' }}>
            <span
              style={{
                fontFamily: LETTERS_FONT_FAMILY,
                fontWeight: 600,
                fontSize: '16cqw',
                lineHeight: '25cqw',
              }}
            >
              {parts.left}
            </span>
            <span style={{ fontFamily: GOST_FONT_FAMILY, lineHeight: '25cqw' }}>
              {parts.digits}
            </span>
            <span
              style={{
                fontFamily: LETTERS_FONT_FAMILY,
                fontWeight: 600,
                fontSize: '16cqw',
                lineHeight: '25cqw',
              }}
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
            borderLeft: '1.2cqw solid #0a0a0a',
            padding: '1.8cqw 0.5cqw 1.4cqw',
          }}
        >
          <span
            style={{
              fontFamily: GOST_FONT_FAMILY,
              fontSize: '13cqw',
              fontWeight: 400,
              lineHeight: 1,
              minHeight: '13cqw',
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
            <span
              style={{
                fontFamily: LETTERS_FONT_FAMILY,
                fontSize: '3.8cqw',
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: '#0a0a0a',
              }}
            >
              RUS
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', width: '6.5cqw' }}>
              <span
                style={{
                  height: '1.3cqw',
                  boxSizing: 'border-box',
                  background: '#fff',
                  border: '0.3cqw solid rgba(0, 0, 0, 0.45)',
                  borderRadius: '0.2cqw',
                }}
              />
              <span style={{ height: '1.3cqw', background: 'rgb(12, 117, 197)' }} />
              <span style={{ height: '1.3cqw', background: '#D52B1E' }} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
