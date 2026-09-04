import React, { useMemo, useState } from 'react';
import { Button, CustomSelect, Div, FormItem, IconButton, Input, Spinner } from '@vkontakte/vkui';
import { Plus, X } from 'lucide-react';
import { useGetCurrencyRates } from '@/features/subscriptions/hooks/useGetCurrencyRates.ts';
import { convertAmount, hasRates } from '@/features/subscriptions/utils/money.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';
import { currencyFlag } from '../model/currency-flag.ts';
import { loadCurrencyState, saveCurrencyState } from '../model/currency-storage.ts';

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/[\s\u00A0\u202F]/g, '').replace(',', '.').trim();
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
    const normalized = query.replace(/^[^\p{L}\p{N}]+/u, '').trim().toLowerCase();
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

  const codes = useMemo(
    () => (hasRates(ratesData) ? Object.keys(ratesData.rates).sort() : []),
    [ratesData],
  );
  const currencyOptions = useMemo(
    () => codes.map((code) => ({ label: `${currencyFlag(code)} ${code}`, value: code })),
    [codes],
  );

  const persist = (nextRows: string[], nextLast: typeof last) => {
    saveCurrencyState({ rows: nextRows, last: nextLast });
  };

  const displayFor = (code: string): string => {
    if (!last) return '';
    if (last.code === code) return last.raw;

    const amount = parseAmount(last.raw);
    if (amount === null || !hasRates(ratesData)) return '';
    const value = convertAmount(amount, last.code, code, ratesData.rates);
    return value === null ? '' : formatAmount(value);
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
            ? convertAmount(amount, last.code, nextRows[0], ratesData.rates)
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
      <Div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spinner size="l" />
      </Div>
    );
  }

  if (isError || !hasRates(ratesData)) {
    return (
      <Div>
        <Button size="l" stretched mode="secondary" disabled>
          Курсы валют недоступны
        </Button>
      </Div>
    );
  }

  return (
    <div>
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
        <Div style={{ paddingTop: 0 }}>
          <Button size="l" stretched mode="secondary" before={<Plus size={20} />} onClick={addRow}>
            Добавить валюту
          </Button>
        </Div>
      )}
    </div>
  );
};
