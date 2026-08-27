import React from 'react';
import { normalizePlate, toDisplayLatin } from '../utils/plateFormat';
import { MONO_FONT_FAMILY, PlateGlyphText } from './PlateGlyphText.tsx';

export const PlateNumber: React.FC<{ plate: string }> = ({ plate }) => {
  const display = toDisplayLatin(normalizePlate(plate));
  const match = /(.+?)(\d{2,3})$/.exec(display);
  const main = match ? match[1] : display;
  const region = match ? match[2] : '';

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '520 / 110',
        containerType: 'inline-size',
        background: '#fff',
        borderRadius: '1.6cqw',
        color: '#0a0a0a',
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 2cqw',
            overflow: 'hidden',
          }}
        >
          <PlateGlyphText text={main} size="25cqw" spacingEm={0.06} />
        </div>
        <div
          style={{
            flex: '0 0 22cqw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderLeft: '1.2cqw solid #0a0a0a',
            padding: '1.8cqw 0.5cqw 1.4cqw',
          }}
        >
          <div
            style={{
              minHeight: '8.5cqw',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PlateGlyphText text={region} size="13cqw" />
          </div>
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
                fontFamily: MONO_FONT_FAMILY,
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
