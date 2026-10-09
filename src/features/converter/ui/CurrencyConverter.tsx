import React, { useMemo, useState } from 'react';
import {
  Button,
  CustomSelect,
  FormItem,
  IconButton,
  Input,
  SegmentedControl,
  Spinner,
} from '@vkontakte/vkui';
import { Plus, X } from 'lucide-react';
import { useGetCurrencyRates } from '@/features/subscriptions/hooks/useGetCurrencyRates.ts';
import {
  convertAmount,
  getRateCurrencies,
  hasRates,
} from '@/features/subscriptions/utils/money.ts';
import type { ConversionMode } from '@/features/subscriptions/utils/money.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';
import { currencyFlag } from '../model/currency-flag.ts';
import {
  loadCurrencyState,
  saveCurrencyState,
  type ConversionDirection,
} from '../model/currency-storage.ts';

function parseAmount(raw: string): number | null {
  const normalized = raw
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(',', '.')
    .trim();
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Во всех инпутах — два знака после запятой */
function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

/**
 * Свой filterFn: поле поиска VKUI предзаполняет лейблом выбранной валюты («🇺🇸 USD»),
 * и пользователь дописывает запрос после флага. Поэтому срезаем ведущие не-буквы (флаг),
 * откидываем известный код текущей валюты как префикс и ищем по остатку подстрокой.
 */
function makeRowFilter(currentCode: string) {
  return (query: string, option: { label: string }): boolean => {
    const normalized = query
      .replace(/^[^\p{L}\p{N}]+/u, '')
      .trim()
      .toLowerCase();
    if (!normalized) return true;

    const current = currentCode.toLowerCase();
    const typed = normalized.startsWith(current) ? normalized.slice(current.length) : normalized;
    const needle = typed.trim() || current;

    return option.label.toLowerCase().includes(needle);
  };
}

export const CurrencyConverter: React.FC = () => {
  const { data: ratesData, isLoading, isError } = useGetCurrencyRates();

  const initial = useMemo(() => loadCurrencyState(), []);
  const [rows, setRows] = useState<string[]>(initial.rows);
  const [last, setLast] = useState(initial.last);
  const [direction, setDirection] = useState<ConversionDirection>(initial.direction);

  const isDirected = hasRates(ratesData) && 'pairs' in ratesData;
  const conversionMode: ConversionMode = direction === 'buy' ? 'price' : 'exchange';

  const codes = useMemo(
    () => (hasRates(ratesData) ? getRateCurrencies(ratesData) : []),
    [ratesData],
  );
  const currencyOptions = useMemo(
    () => codes.map((code) => ({ label: `${currencyFlag(code)} ${code}`, value: code })),
    [codes],
  );

  const persist = (
    nextRows: string[],
    nextLast: typeof last,
    nextDirection: ConversionDirection = direction,
  ) => {
    saveCurrencyState({ rows: nextRows, last: nextLast, direction: nextDirection });
  };

  const displayFor = (code: string): string => {
    if (!last) return '';
    if (last.code === code) return last.raw;

    const amount = parseAmount(last.raw);
    if (amount === null || !hasRates(ratesData)) return '';
    const value = convertAmount(amount, last.code, code, ratesData, conversionMode);
    return value === null ? '' : formatAmount(value);
  };

  const changeDirection = (next: ConversionDirection) => {
    haptic.impact('light');
    setDirection(next);
    persist(rows, last, next);
  };

  const editRow = (code: string, raw: string) => {
    const nextLast = { code, raw };
    setLast(nextLast);
    persist(rows, nextLast);
  };

  /** При фокусе на вычисленной строке убираем форматирование, чтобы ввод не склеивался с NBSP */
  const focusRow = (code: string) => {
    if (!last || last.code === code) return;
    const cleaned = displayFor(code).replace(/[\s\u00A0\u202F]/g, '');
    setLast({ code, raw: cleaned });
  };

  /** Выбор валюты, которая уже есть в списке, меняет строки местами */
  const changeRow = (index: number, code: string) => {
    if (!code || rows[index] === code) return;
    haptic.impact('light');
    const nextRows = [...rows];
    const existingIndex = nextRows.indexOf(code);
    nextRows[index] = code;
    if (existingIndex !== -1) {
      nextRows[existingIndex] = rows[index];
    }
    setRows(nextRows);
    persist(nextRows, last);
  };

  /** Добавляем первую валюту из списка, которой ещё нет в строках */
  const addRow = () => {
    const nextCode = codes.find((code) => !rows.includes(code));
    if (!nextCode) return;
    haptic.impact('light');
    const nextRows = [...rows, nextCode];
    setRows(nextRows);
    persist(nextRows, last);
  };

  const removeRow = (code: string) => {
    haptic.impact('light');
    const nextRows = rows.filter((row) => row !== code);

    let nextLast = last;
    if (last && !nextRows.includes(last.code)) {
      // Удалили строку последнего ввода — переводим её сумму в валюту первой оставшейся
      if (nextRows.length > 0 && hasRates(ratesData)) {
        const amount = parseAmount(last.raw);
        const converted =
          amount !== null
            ? convertAmount(amount, last.code, nextRows[0], ratesData, conversionMode)
            : null;
        nextLast = {
          code: nextRows[0],
          raw: converted !== null ? converted.toFixed(2).replace('.', ',') : '',
        };
      } else {
        nextLast = null;
      }
    }

    setRows(nextRows);
    setLast(nextLast);
    persist(nextRows, nextLast);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !hasRates(ratesData)) {
    return (
      <div>
        <Button size="l" stretched mode="secondary" disabled>
          Курсы валют недоступны
        </Button>
      </div>
    );
  }

  return (
    <div>
      {isDirected && (
        <FormItem top="Направление">
          <SegmentedControl
            value={direction}
            options={[
              { label: 'Продаю', value: 'sell' },
              { label: 'Покупаю', value: 'buy' },
            ]}
            onChange={(value) => changeDirection(value as ConversionDirection)}
          />
        </FormItem>
      )}
      <FormItem top="Валюты">
        <div>
          {rows.map((code, index) => (
            <div
              // Строки позиционные: при свапе индексный ключ не перемонтирует инпуты
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={index}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
            >
              <CustomSelect
                value={code}
                options={currencyOptions}
                searchable
                filterFn={makeRowFilter(code)}
                onChange={(event) => changeRow(index, event.target.value)}
                style={{ width: 138, flexShrink: 0 }}
              />
              <Input
                inputMode="decimal"
                value={displayFor(code)}
                onChange={(event) => editRow(code, event.target.value)}
                onFocus={() => focusRow(code)}
                placeholder="0"
              />
              {rows.length > 1 && (
                <IconButton
                  aria-label={`Убрать ${code}`}
                  onClick={() => removeRow(code)}
                  style={{ flexShrink: 0 }}
                >
                  <X size={18} />
                </IconButton>
              )}
            </div>
          ))}
        </div>
      </FormItem>

      {rows.length < codes.length && (
        <div style={{ paddingTop: 0 }}>
          <Button size="l" stretched mode="secondary" before={<Plus size={20} />} onClick={addRow}>
            Добавить валюту
          </Button>
        </div>
      )}
    </div>
  );
};
