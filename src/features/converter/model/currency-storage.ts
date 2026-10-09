export type ConversionDirection = 'sell' | 'buy';

export interface CurrencyConverterState {
  rows: string[];
  last: { code: string; raw: string } | null;
  direction: ConversionDirection;
}

const STORAGE_KEY = 'converter:currency';
const DEFAULT_ROWS = ['USD', 'RUB', 'KZT'];

export function loadCurrencyState(): CurrencyConverterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CurrencyConverterState>;
      const rows = parsed.rows;
      const isValid =
        Array.isArray(rows) && rows.length > 0 && rows.every((code) => typeof code === 'string');

      if (isValid) {
        const last = parsed.last;
        const lastIsValid =
          !!last &&
          typeof last.code === 'string' &&
          typeof last.raw === 'string' &&
          rows.includes(last.code);

        const direction: ConversionDirection = parsed.direction === 'buy' ? 'buy' : 'sell';

        return { rows, last: lastIsValid ? last : null, direction };
      }
    }
  } catch {
    // Битые данные в localStorage — используем значения по умолчанию
  }

  return { rows: DEFAULT_ROWS, last: { code: DEFAULT_ROWS[0], raw: '100' }, direction: 'sell' };
}

export function saveCurrencyState(state: CurrencyConverterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Нет доступа к localStorage — некритично, конвертер работает и без сохранения
  }
}
