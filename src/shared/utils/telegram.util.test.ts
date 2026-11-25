import { beforeEach, describe, expect, it, vi } from 'vitest';

const telegram = vi.hoisted(() => ({
  startParam: vi.fn(),
  user: vi.fn(),
  chatType: vi.fn(),
}));

vi.mock('@telegram-apps/sdk-react', () => ({
  initData: {
    startParam: telegram.startParam,
    user: telegram.user,
    chatType: telegram.chatType,
  },
}));

import { getChatId, getEffectiveChatId } from './telegram.util';

describe('getEffectiveChatId', () => {
  beforeEach(() => {
    telegram.startParam.mockReset();
    telegram.user.mockReset();
  });

  it('использует startParam группы в приоритете', () => {
    telegram.startParam.mockReturnValue('-100');
    telegram.user.mockReturnValue({ id: 111 });
    expect(getEffectiveChatId()).toBe(-100);
    expect(getChatId()).toBe(-100);
  });

  it('для личного мини-аппа использует id пользователя', () => {
    telegram.startParam.mockReturnValue(undefined);
    telegram.user.mockReturnValue({ id: 111 });
    expect(getEffectiveChatId()).toBe(111);
  });
});
