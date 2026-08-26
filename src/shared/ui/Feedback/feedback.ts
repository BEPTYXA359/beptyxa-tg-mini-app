import { createContext, useContext } from 'react';

export type FeedbackVariant = 'success' | 'error' | 'info';

export interface FeedbackApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  undo: (message: string, onUndo: () => void, duration?: number) => void;
}

export const FeedbackContext = createContext<FeedbackApi | null>(null);

export const useFeedback = (): FeedbackApi => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
};
