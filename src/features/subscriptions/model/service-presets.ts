export interface ServicePreset {
  name: string;
  service?: string;
  color: string;
}

export const SERVICE_PRESETS: ServicePreset[] = [
  { name: 'Netflix', color: '#E50914' },
  { name: 'YouTube Premium', service: 'Google', color: '#FF0000' },
  { name: 'Spotify', color: '#1DB954' },
  { name: 'Яндекс Плюс', service: 'Яндекс', color: '#FFCC00' },
  { name: 'Кинопоиск', service: 'Яндекс', color: '#FF6D00' },
  { name: 'VK Музыка', service: 'VK', color: '#0077FF' },
  { name: 'СберПрайм', service: 'Сбер', color: '#21A038' },
  { name: 'Steam', color: '#1B2838' },
  { name: 'iCloud+', service: 'Apple', color: '#3478F6' },
  { name: 'ChatGPT', service: 'OpenAI', color: '#10A37F' },
  { name: 'Twitch', color: '#9146FF' },
  { name: 'Discord Nitro', service: 'Discord', color: '#5865F2' },
  { name: 'Google One', service: 'Google', color: '#4285F4' },
  { name: 'Xbox Game Pass', service: 'Microsoft', color: '#107C10' },
  { name: 'Figma', color: '#A259FF' },
];

export const COLOR_PALETTE: string[] = [
  '#E50914',
  '#FF6D00',
  '#FFCC00',
  '#1DB954',
  '#0077FF',
  '#9146FF',
  '#10A37F',
  '#8E8E93',
];
