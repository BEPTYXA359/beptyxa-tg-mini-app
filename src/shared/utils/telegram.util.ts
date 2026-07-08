import { initData } from '@telegram-apps/sdk-react';

export const getChatId = (): number | undefined => {
  return Number(initData.startParam()) || undefined;
};
