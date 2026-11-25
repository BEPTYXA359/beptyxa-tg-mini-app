import { initData } from '@telegram-apps/sdk-react';

export const getChatId = (): number | undefined => {
  return Number(initData.startParam()) || undefined;
};

export const getEffectiveChatId = (): number | undefined => {
  return getChatId() ?? initData.user()?.id;
};

export const getIsGroupChat = (): boolean => {
  const type = initData.chatType();
  return type === 'group' || type === 'supergroup' || type === 'channel';
};
