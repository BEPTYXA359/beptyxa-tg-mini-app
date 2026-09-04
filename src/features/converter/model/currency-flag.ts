/** Коды без привязки к одной стране (наднациональные и металлы) — флага нет */
const NON_COUNTRY_CODES = new Set([
  'XAF',
  'XOF',
  'XCD',
  'XDR',
  'XPF',
  'XAU',
  'XAG',
  'XPT',
  'XTS',
  'XXX',
]);

/**
 * Флаг по первым двум буквам ISO-кода (USD → 🇺🇸, EUR → 🇪🇺, GBP → 🇬🇧).
 * Для большинства валют код начинается со страны; исключения — выше.
 */
export function currencyFlag(code: string): string {
  if (NON_COUNTRY_CODES.has(code)) return '🏳️';

  const base = code.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(base)) return '🏳️';

  return String.fromCodePoint(...[...base].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}
