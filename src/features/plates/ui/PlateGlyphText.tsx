import React from 'react';
import { PLATE_FONT_SCALE, PLATE_GLYPH_BOUNDS, PLATE_GLYPHS } from './plateGlyphs.generated';

export const MONO_FONT_FAMILY =
  "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

interface PlateGlyphTextProps {
  text: string;
  /** Em-equivalent of the old CSS font-size; the glyph box height is size * PLATE_FONT_SCALE. */
  size: string;
  /** Tracking between glyphs, fraction of size (same semantics as CSS letter-spacing / font-size). */
  spacingEm?: number;
}

const UNITS_PER_EM = 1000;
const FALLBACK_SIZE_RATIO = 0.8;
const FALLBACK_LINE_HEIGHT = PLATE_FONT_SCALE / FALLBACK_SIZE_RATIO;

interface Chunk {
  kind: 'glyph' | 'text';
  value: string;
}

const chunkText = (text: string): Chunk[] => {
  const chunks: Chunk[] = [];
  for (const char of [...text]) {
    const kind = PLATE_GLYPHS[char] ? 'glyph' : 'text';
    const last = chunks[chunks.length - 1];
    if (last && last.kind === kind) {
      last.value += char;
    } else {
      chunks.push({ kind, value: char });
    }
  }
  return chunks;
};

const PlateGlyphRun: React.FC<{ value: string; gap: number; size: string }> = ({
  value,
  gap,
  size,
}) => {
  const placed: Array<{ char: string; x: number }> = [];
  let cursor = 0;
  for (const char of [...value]) {
    placed.push({ char, x: cursor });
    cursor += PLATE_GLYPHS[char].advance + gap;
  }
  const totalWidth = cursor - gap;
  const { minY, maxY } = PLATE_GLYPH_BOUNDS;
  const viewBoxHeight = maxY - minY;

  return (
    <svg
      role="img"
      aria-label={value}
      viewBox={`0 ${minY} ${totalWidth} ${viewBoxHeight}`}
      style={{
        display: 'block',
        height: `calc(${size} * ${PLATE_FONT_SCALE})`,
        width: `calc(${size} * ${((PLATE_FONT_SCALE * totalWidth) / viewBoxHeight).toFixed(4)})`,
      }}
    >
      {placed.map(({ char, x }) => (
        <path
          key={x}
          d={PLATE_GLYPHS[char].d}
          transform={`translate(${x} 0)`}
          fill="currentColor"
        />
      ))}
    </svg>
  );
};

export const PlateGlyphText: React.FC<PlateGlyphTextProps> = ({ text, size, spacingEm = 0 }) => {
  const chunks = chunkText(text);
  if (chunks.length === 0) return null;

  const gap = spacingEm * UNITS_PER_EM;
  if (chunks.length === 1 && chunks[0].kind === 'glyph') {
    return <PlateGlyphRun value={chunks[0].value} gap={gap} size={size} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        columnGap: `calc(${size} * ${spacingEm})`,
      }}
    >
      {chunks.map((chunk) =>
        chunk.kind === 'glyph' ? (
          <PlateGlyphRun key={`glyph:${chunk.value}`} value={chunk.value} gap={gap} size={size} />
        ) : (
          <span
            key={`text:${chunk.value}`}
            style={{
              fontFamily: MONO_FONT_FAMILY,
              fontSize: `calc(${size} * ${FALLBACK_SIZE_RATIO})`,
              lineHeight: FALLBACK_LINE_HEIGHT,
              fontWeight: 400,
              whiteSpace: 'pre',
            }}
          >
            {chunk.value}
          </span>
        ),
      )}
    </div>
  );
};
