interface UndoDeleteSchedulerOptions {
  delayMs: number;
  onDelete: (id: string) => Promise<void>;
  onError?: (id: string) => void;
  pending?: Map<string, ReturnType<typeof setTimeout>>;
}

export const createUndoDeleteScheduler = ({
  delayMs,
  onDelete,
  onError,
  pending = new Map<string, ReturnType<typeof setTimeout>>(),
}: UndoDeleteSchedulerOptions) => {
  const schedule = (id: string) => {
    const previousTimer = pending.get(id);
    if (previousTimer) clearTimeout(previousTimer);

    const timer = setTimeout(() => {
      pending.delete(id);
      void onDelete(id).catch(() => onError?.(id));
    }, delayMs);
    pending.set(id, timer);
  };

  const cancelPending = (): string[] => {
    const ids = [...pending.keys()];
    pending.forEach((timer) => clearTimeout(timer));
    pending.clear();
    return ids;
  };

  return { schedule, cancelPending };
};
