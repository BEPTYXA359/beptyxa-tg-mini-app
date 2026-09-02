import { useSyncExternalStore } from 'react';

let snapshot: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const replace = (next: ReadonlySet<string>) => {
  snapshot = next;
  emit();
};

export const markPendingDeletion = (id: string) => {
  if (snapshot.has(id)) return;
  replace(new Set(snapshot).add(id));
};

export const unmarkPendingDeletion = (id: string) => {
  if (!snapshot.has(id)) return;
  const next = new Set(snapshot);
  next.delete(id);
  replace(next);
};

export const unmarkPendingDeletions = (ids: string[]) => {
  const next = new Set(snapshot);
  let changed = false;
  for (const id of ids) {
    changed = next.delete(id) || changed;
  }
  if (changed) replace(next);
};

export const usePendingDeletionIds = (): ReadonlySet<string> =>
  useSyncExternalStore(subscribe, () => snapshot);
