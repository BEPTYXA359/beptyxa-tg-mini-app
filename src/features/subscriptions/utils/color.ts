/**
 * Цвет текста, контрастный на подложке цвета карточки подписки.
 * Порог по YIQ-яркости: на светлых подложках чёрный, на тёмных — белый.
 * Подходит и для светлой, и для тёмной темы, потому что подложка задана явно.
 */
export function contrastTextColor(hex?: string): string {
  if (!hex) return 'var(--vkui--color_icon_secondary)';
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#FFFFFF';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#FFFFFF';
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#000000' : '#FFFFFF';
}
