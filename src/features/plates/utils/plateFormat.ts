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

const CYRILLIC_TO_LATIN: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_CYRILLIC).map(([latin, cyrillic]) => [cyrillic, latin]),
);

export const toDisplayLatin = (text: string): string =>
  text.replace(new RegExp(`[${RU_PLATE_LETTERS}]`, 'g'), (char) => CYRILLIC_TO_LATIN[char] ?? char);

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

const PARTIAL_SLOTS: Array<{ key: keyof PlateParts; max: number; letters: boolean }> = [
  { key: 'left', max: 1, letters: true },
  { key: 'digits', max: 3, letters: false },
  { key: 'right', max: 2, letters: true },
  { key: 'region', max: 3, letters: false },
];

export const parsePartialPlate = (plate: string): PlateParts => {
  const parts: PlateParts = { left: '', digits: '', right: '', region: '' };
  for (const char of normalizePlate(plate)) {
    const isLetter = RU_PLATE_LETTERS.includes(char);
    const isDigit = char >= '0' && char <= '9';
    if (!isLetter && !isDigit) continue;
    for (const slot of PARTIAL_SLOTS) {
      if (slot.letters === isLetter && parts[slot.key].length < slot.max) {
        parts[slot.key] += char;
        break;
      }
    }
  }
  return parts;
};
