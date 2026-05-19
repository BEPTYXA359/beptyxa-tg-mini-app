import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  init,
} from '@telegram-apps/sdk-react';

export async function initTelegram(): Promise<void> {
  init();

  if (!backButton.isSupported() || !miniApp.isSupported()) {
    console.warn('Внимание: Некоторые функции Telegram API не поддерживаются на этом клиенте.');
  }

  initData.restore();

  backButton.mount();
  await miniApp.mount();
  await themeParams.mount();

  void viewport
    .mount()
    .then(() => {
      viewport.bindCssVars();
    })
    .catch((e) => {
      console.error('Ошибка монтирования Viewport:', e);
    });

  miniApp.bindCssVars();
  themeParams.bindCssVars();
}
