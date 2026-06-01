import { initData } from '@telegram-apps/sdk-react';

export const getChatId = (): string | undefined => {
  return initData.startParam() || undefined;
};
