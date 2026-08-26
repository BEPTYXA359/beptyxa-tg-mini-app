export const RU_PLATE_LETTERS = 'АВЕКМНОРСТУХ';

const LATIN_TO_CYRILLIC: Record<string, string> = {
  A: 'А',
  B: 'В',
  E: 'Е',
  K: 'К',
  M: 'М',
  H: 'Н',
  O: 'О',
  P: 'Р',
  C: 'С',
  T: 'Т',
  Y: 'У',
  X: 'Х',
};

export const RU_PLATE_REGEX = new RegExp(
  `^[${RU_PLATE_LETTERS}]\\d{3}[${RU_PLATE_LETTERS}]{2}\\d{2,3}$`,
);

export const normalizePlate = (raw: string): string =>
  raw
    .toUpperCase()
    .replace(/[\s.-]/g, '')
    .replace(/[ABEKMHOPTCYX]/g, (char) => LATIN_TO_CYRILLIC[char] ?? char);

export interface PlateParts {
  left: string;
  digits: string;
  right: string;
  region: string;
}

const PLATE_PARTS_REGEX = new RegExp(
  `^([${RU_PLATE_LETTERS}])(\\d{3})([${RU_PLATE_LETTERS}]{2})(\\d{2,3})$`,
);

export const parsePlateParts = (plate: string): PlateParts | null => {
  const match = PLATE_PARTS_REGEX.exec(normalizePlate(plate));
  if (!match) return null;
  return { left: match[1], digits: match[2], right: match[3], region: match[4] };
};
