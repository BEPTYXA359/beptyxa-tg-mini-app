export type ConverterSource = 'openexchangerates' | 'cbrf' | 'tbank';

export type SteamConversionPath = 'converter' | 'steam' | 'usd_bridge';

export interface SteamConversionSettings {
  region: string;
  targetCurrency: string;
  path: SteamConversionPath;
  ratesSource: ConverterSource;
  extraPercent: number;
}

export interface ConversionSettings {
  ratesSource: ConverterSource;
  steam: SteamConversionSettings;
}

export interface UpdateConversionSettings {
  ratesSource?: ConverterSource;
  steam?: Partial<SteamConversionSettings>;
}

export const CONVERTER_SOURCE_OPTIONS: Array<{ label: string; value: ConverterSource }> = [
  { label: 'OpenExchangeRates', value: 'openexchangerates' },
  { label: 'ЦБ РФ', value: 'cbrf' },
  { label: 'Т-Банк', value: 'tbank' },
];

export const STEAM_PATH_OPTIONS: Array<{ label: string; value: SteamConversionPath }> = [
  { label: 'Всё по курсу конвертера (по умолчанию)', value: 'converter' },
  { label: 'Steam → USD → курс конвертера (покупка $)', value: 'usd_bridge' },
  { label: 'Всё по курсу Steam', value: 'steam' },
];

interface SteamRegion {
  value: string;
  flag: string;
  name: string;
  currency: string;
}

const REGIONS: SteamRegion[] = [
  { value: 'kz', flag: '🇰🇿', name: 'Казахстан', currency: 'KZT' },
  { value: 'ru', flag: '🇷🇺', name: 'Россия', currency: 'RUB' },
  { value: 'tr', flag: '🇹🇷', name: 'Турция', currency: 'USD' },
  { value: 'us', flag: '🇺🇸', name: 'США', currency: 'USD' },
  { value: 'de', flag: '🇪🇺', name: 'Евросоюз', currency: 'EUR' },
  { value: 'gb', flag: '🇬🇧', name: 'Великобритания', currency: 'GBP' },
  { value: 'ua', flag: '🇺🇦', name: 'Украина', currency: 'UAH' },
  { value: 'ar', flag: '🇦🇷', name: 'Аргентина', currency: 'USD' },
  { value: 'br', flag: '🇧🇷', name: 'Бразилия', currency: 'BRL' },
  { value: 'cl', flag: '🇨🇱', name: 'Чили', currency: 'CLP' },
  { value: 'co', flag: '🇨🇴', name: 'Колумбия', currency: 'COP' },
  { value: 'mx', flag: '🇲🇽', name: 'Мексика', currency: 'MXN' },
  { value: 'pe', flag: '🇵🇪', name: 'Перу', currency: 'PEN' },
  { value: 'uy', flag: '🇺🇾', name: 'Уругвай', currency: 'UYU' },
  { value: 'hn', flag: '🇭🇳', name: 'Гондурас', currency: 'HNL' },
  { value: 'cr', flag: '🇨🇷', name: 'Коста-Рика', currency: 'CRC' },
  { value: 'ca', flag: '🇨🇦', name: 'Канада', currency: 'CAD' },
  { value: 'no', flag: '🇳🇴', name: 'Норвегия', currency: 'NOK' },
  { value: 'ch', flag: '🇨🇭', name: 'Швейцария', currency: 'CHF' },
  { value: 'pl', flag: '🇵🇱', name: 'Польша', currency: 'PLN' },
  { value: 'il', flag: '🇮🇱', name: 'Израиль', currency: 'ILS' },
  { value: 'za', flag: '🇿🇦', name: 'ЮАР', currency: 'ZAR' },
  { value: 'sa', flag: '🇸🇦', name: 'Саудовская Аравия', currency: 'SAR' },
  { value: 'ae', flag: '🇦🇪', name: 'ОАЭ', currency: 'AED' },
  { value: 'qa', flag: '🇶🇦', name: 'Катар', currency: 'QAR' },
  { value: 'kw', flag: '🇰🇼', name: 'Кувейт', currency: 'KWD' },
  { value: 'in', flag: '🇮🇳', name: 'Индия', currency: 'INR' },
  { value: 'id', flag: '🇮🇩', name: 'Индонезия', currency: 'IDR' },
  { value: 'my', flag: '🇲🇾', name: 'Малайзия', currency: 'MYR' },
  { value: 'ph', flag: '🇵🇭', name: 'Филиппины', currency: 'PHP' },
  { value: 'sg', flag: '🇸🇬', name: 'Сингапур', currency: 'SGD' },
  { value: 'th', flag: '🇹🇭', name: 'Таиланд', currency: 'THB' },
  { value: 'vn', flag: '🇻🇳', name: 'Вьетнам', currency: 'VND' },
  { value: 'cn', flag: '🇨🇳', name: 'Китай', currency: 'CNY' },
  { value: 'hk', flag: '🇭🇰', name: 'Гонконг', currency: 'HKD' },
  { value: 'tw', flag: '🇹🇼', name: 'Тайвань', currency: 'TWD' },
  { value: 'jp', flag: '🇯🇵', name: 'Япония', currency: 'JPY' },
  { value: 'kr', flag: '🇰🇷', name: 'Корея', currency: 'KRW' },
  { value: 'au', flag: '🇦🇺', name: 'Австралия', currency: 'AUD' },
  { value: 'nz', flag: '🇳🇿', name: 'Новая Зеландия', currency: 'NZD' },
  { value: 'az', flag: '🇦🇿', name: 'Азербайджан', currency: 'AZN' },
  { value: 'am', flag: '🇦🇲', name: 'Армения', currency: 'AMD' },
  { value: 'ge', flag: '🇬🇪', name: 'Грузия', currency: 'GEL' },
  { value: 'md', flag: '🇲🇩', name: 'Молдова', currency: 'MDL' },
  { value: 'kg', flag: '🇰🇬', name: 'Кыргызстан', currency: 'KGS' },
  { value: 'uz', flag: '🇺🇿', name: 'Узбекистан', currency: 'UZS' },
];

/** Избранные регионы — всегда вверху списка, остальные по алфавиту */
const TOP_REGION_VALUES = ['ru', 'kz', 'tr'];

const regionByValue = new Map(REGIONS.map((region) => [region.value, region]));

const toOption = (region: SteamRegion): { label: string; value: string } => ({
  label: `${region.flag} ${region.name} (${region.currency})`,
  value: region.value,
});

export const STEAM_REGION_OPTIONS: Array<{ label: string; value: string }> = [
  ...TOP_REGION_VALUES.map((value) => regionByValue.get(value))
    .filter((region): region is SteamRegion => region !== undefined)
    .map(toOption),
  ...REGIONS.filter((region) => !TOP_REGION_VALUES.includes(region.value))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    .map(toOption),
];

export const STEAM_TARGET_CURRENCY_FALLBACK: Array<{ label: string; value: string }> = [
  { label: '₽ RUB', value: 'RUB' },
  { label: '$ USD', value: 'USD' },
  { label: '€ EUR', value: 'EUR' },
  { label: '₸ KZT', value: 'KZT' },
  { label: '₴ UAH', value: 'UAH' },
  { label: '£ GBP', value: 'GBP' },
];
