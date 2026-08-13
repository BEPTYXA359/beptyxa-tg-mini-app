import { useSignal, themeParams } from '@telegram-apps/sdk-react';
import type { ColorSchemeType } from '@vkontakte/vkui';

/**
 * Реактивно отдаёт текущую тему Telegram (light/dark) для ConfigProvider.colorScheme.
 * Основано на signal themeParams.isDark.
 */
export const useTgAppearance = (): ColorSchemeType => {
  const isDark = useSignal(themeParams.isDark);
  return isDark ? 'dark' : 'light';
};
