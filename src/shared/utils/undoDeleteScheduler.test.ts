import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUndoDeleteScheduler } from './undoDeleteScheduler';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('undo delete scheduler', () => {
  it('cancels every pending id when a newer snackbar is undone', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const scheduler = createUndoDeleteScheduler({ delayMs: 4000, onDelete });

    scheduler.schedule('first');
    scheduler.schedule('second');
    expect(scheduler.cancelPending()).toEqual(['first', 'second']);

    await vi.advanceTimersByTimeAsync(4000);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('cancels only ids whose delete has not fired', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const scheduler = createUndoDeleteScheduler({ delayMs: 4000, onDelete });

    scheduler.schedule('first');
    await vi.advanceTimersByTimeAsync(1000);
    scheduler.schedule('second');
    await vi.advanceTimersByTimeAsync(3000);

    expect(onDelete).toHaveBeenCalledExactlyOnceWith('first');
    expect(scheduler.cancelPending()).toEqual(['second']);

    await vi.advanceTimersByTimeAsync(4000);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('reports a failed delete for the fired id', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('DELETE failed'));
    const onError = vi.fn();
    const scheduler = createUndoDeleteScheduler({ delayMs: 4000, onDelete, onError });

    scheduler.schedule('first');
    await vi.advanceTimersByTimeAsync(4000);

    expect(onError).toHaveBeenCalledExactlyOnceWith('first');
  });

  it('cancels pending ids shared by schedulers from different screens', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const pending = new Map<string, ReturnType<typeof setTimeout>>();
    const listScheduler = createUndoDeleteScheduler({ delayMs: 4000, onDelete, pending });
    const formScheduler = createUndoDeleteScheduler({ delayMs: 4000, onDelete, pending });

    listScheduler.schedule('from-list');
    formScheduler.schedule('from-form');

    expect(formScheduler.cancelPending()).toEqual(['from-list', 'from-form']);
    await vi.advanceTimersByTimeAsync(4000);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
