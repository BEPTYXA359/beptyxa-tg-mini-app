import React, { useMemo, useState } from 'react';
import { Card, CustomSelect, Div, FormItem, IconButton, Input, Text } from '@vkontakte/vkui';
import { ArrowLeftRight } from 'lucide-react';
import {
  UNIT_CATEGORY_OPTIONS,
  convertUnit,
  formatUnitResult,
  getCategory,
  getUnit,
} from '../model/units.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function unitOptions(category: ReturnType<typeof getCategory>) {
  return category.units.map((unit) => ({ label: unit.label, value: unit.id }));
}

export const UnitsConverter: React.FC = () => {
  const [categoryId, setCategoryId] = useState(UNIT_CATEGORY_OPTIONS[0].value);
  const [amountRaw, setAmountRaw] = useState('1');
  const [fromId, setFromId] = useState('km');
  const [toId, setToId] = useState('mi');

  const category = useMemo(() => getCategory(categoryId), [categoryId]);
  // При смене категории сохранённые единицы могли остаться от прошлой — подменяем на первые
  const fromUnit = useMemo(() => getUnit(category, fromId), [category, fromId]);
  const toUnit = useMemo(() => getUnit(category, toId), [category, toId]);

  const options = useMemo(() => unitOptions(category), [category]);

  const amount = parseAmount(amountRaw);
  const result = amount !== null ? convertUnit(amount, fromUnit, toUnit) : null;

  const swap = () => {
    haptic.impact('light');
    setFromId(toUnit.id);
    setToId(fromUnit.id);
  };

  return (
    <div>
      <FormItem top="Категория">
        <CustomSelect
          value={categoryId}
          options={UNIT_CATEGORY_OPTIONS}
          onChange={(event) => setCategoryId(event.target.value)}
        />
      </FormItem>

      <FormItem top="Сумма">
        <Input
          inputMode="decimal"
          value={amountRaw}
          onChange={(event) => setAmountRaw(event.target.value)}
          placeholder="1"
        />
      </FormItem>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <FormItem top="Из" style={{ flex: 1 }}>
          <CustomSelect
            value={fromUnit.id}
            options={options}
            onChange={(event) => setFromId(event.target.value)}
          />
        </FormItem>
        <IconButton
          aria-label="Поменять единицы"
          onClick={swap}
          style={{ marginBottom: 12, flexShrink: 0 }}
        >
          <ArrowLeftRight size={20} />
        </IconButton>
        <FormItem top="В" style={{ flex: 1 }}>
          <CustomSelect
            value={toUnit.id}
            options={options}
            onChange={(event) => setToId(event.target.value)}
          />
        </FormItem>
      </div>

      <Div>
        <Card mode="tint" style={{ padding: 16, textAlign: 'center' }}>
          {amount !== null && result !== null ? (
            <Text weight="2" style={{ fontSize: 22 }}>
              {formatUnitResult(result)} — {toUnit.label}
            </Text>
          ) : (
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              Введите значение, чтобы увидеть результат
            </Text>
          )}
        </Card>
      </Div>
    </div>
  );
};
