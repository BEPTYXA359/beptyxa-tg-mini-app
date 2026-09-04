export interface UnitDef {
  id: string;
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export interface UnitCategory {
  id: string;
  label: string;
  units: UnitDef[];
}

function linear(factor: number): Pick<UnitDef, 'toBase' | 'fromBase'> {
  return {
    toBase: (value) => value * factor,
    fromBase: (value) => value / factor,
  };
}

function temperature(toBase: (v: number) => number, fromBase: (v: number) => number) {
  return { toBase, fromBase };
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Длина',
    units: [
      { id: 'km', label: 'км', ...linear(1000) },
      { id: 'm', label: 'м', ...linear(1) },
      { id: 'cm', label: 'см', ...linear(0.01) },
      { id: 'mm', label: 'мм', ...linear(0.001) },
      { id: 'mi', label: 'миля', ...linear(1609.344) },
      { id: 'nmi', label: 'мор. миля', ...linear(1852) },
      { id: 'yd', label: 'ярд', ...linear(0.9144) },
      { id: 'ft', label: 'фут', ...linear(0.3048) },
      { id: 'in', label: 'дюйм', ...linear(0.0254) },
    ],
  },
  {
    id: 'mass',
    label: 'Масса',
    units: [
      { id: 't', label: 'т', ...linear(1000) },
      { id: 'kg', label: 'кг', ...linear(1) },
      { id: 'g', label: 'г', ...linear(0.001) },
      { id: 'mg', label: 'мг', ...linear(0.000001) },
      { id: 'lb', label: 'фунт', ...linear(0.45359237) },
      { id: 'oz', label: 'унция', ...linear(0.028349523125) },
      { id: 'st', label: 'стоун', ...linear(6.35029318) },
      { id: 'ct', label: 'карат', ...linear(0.0002) },
    ],
  },
  {
    id: 'temperature',
    label: 'Температура',
    units: [
      {
        id: 'c',
        label: '°C',
        ...temperature(
          (v) => v + 273.15,
          (v) => v - 273.15,
        ),
      },
      {
        id: 'f',
        label: '°F',
        ...temperature(
          (v) => ((v - 32) * 5) / 9 + 273.15,
          (v) => ((v - 273.15) * 9) / 5 + 32,
        ),
      },
      {
        id: 'k',
        label: 'K',
        ...temperature(
          (v) => v,
          (v) => v,
        ),
      },
    ],
  },
  {
    id: 'volume',
    label: 'Объём',
    units: [
      { id: 'l', label: 'л', ...linear(1) },
      { id: 'ml', label: 'мл', ...linear(0.001) },
      { id: 'm3', label: 'м³', ...linear(1000) },
      { id: 'gal', label: 'галлон', ...linear(3.785411784) },
      { id: 'qt', label: 'кварта', ...linear(0.946352946) },
      { id: 'pt', label: 'пинта', ...linear(0.473176473) },
      { id: 'cup', label: 'чашка', ...linear(0.2365882365) },
      { id: 'bbl', label: 'баррель', ...linear(158.987294928) },
    ],
  },
  {
    id: 'speed',
    label: 'Скорость',
    units: [
      { id: 'kmh', label: 'км/ч', ...linear(1) },
      { id: 'ms', label: 'м/с', ...linear(3.6) },
      { id: 'mph', label: 'миль/ч', ...linear(1.609344) },
      { id: 'kn', label: 'узел', ...linear(1.852) },
      { id: 'fts', label: 'фут/с', ...linear(1.09728) },
    ],
  },
  {
    id: 'area',
    label: 'Площадь',
    units: [
      { id: 'km2', label: 'км²', ...linear(1000000) },
      { id: 'm2', label: 'м²', ...linear(1) },
      { id: 'cm2', label: 'см²', ...linear(0.0001) },
      { id: 'ha', label: 'га', ...linear(10000) },
      { id: 'acre', label: 'акр', ...linear(4046.8564224) },
      { id: 'mi2', label: 'миля²', ...linear(2589988.110336) },
      { id: 'ft2', label: 'фут²', ...linear(0.09290304) },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    units: [
      { id: 'bit', label: 'бит', ...linear(0.125) },
      { id: 'b', label: 'Б', ...linear(1) },
      { id: 'kb', label: 'КБ', ...linear(1024) },
      { id: 'mb', label: 'МБ', ...linear(1024 ** 2) },
      { id: 'gb', label: 'ГБ', ...linear(1024 ** 3) },
      { id: 'tb', label: 'ТБ', ...linear(1024 ** 4) },
    ],
  },
];

export function getCategory(categoryId: string): UnitCategory {
  return UNIT_CATEGORIES.find((category) => category.id === categoryId) ?? UNIT_CATEGORIES[0];
}

export function getUnit(category: UnitCategory, unitId: string): UnitDef {
  return category.units.find((unit) => unit.id === unitId) ?? category.units[0];
}

export function convertUnit(value: number, from: UnitDef, to: UnitDef): number {
  return to.fromBase(from.toBase(value));
}

export function formatUnitResult(value: number): string {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
}

export const UNIT_CATEGORY_OPTIONS = UNIT_CATEGORIES.map((category) => ({
  label: category.label,
  value: category.id,
}));
