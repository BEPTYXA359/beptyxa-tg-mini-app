import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Snackbar } from '@vkontakte/vkui';
import { Check, Info, TriangleAlert, Undo2 } from 'lucide-react';
import { haptic } from '@/shared/utils/haptic.util';
import { FeedbackContext, type FeedbackApi, type FeedbackVariant } from './feedback';

interface Snack {
  key: number;
  variant: FeedbackVariant;
  message: string;
  action?: React.ReactNode;
  onActionClick?: () => void;
  duration: number;
}

const DEFAULT_DURATION = 4000;

const iconFor = (variant: FeedbackVariant): React.ReactNode => {
  const Icon = variant === 'success' ? Check : variant === 'error' ? TriangleAlert : Info;
  const color =
    variant === 'success'
      ? 'var(--vkui--color_icon_positive)'
      : variant === 'error'
        ? 'var(--vkui--color_icon_negative)'
        : 'var(--vkui--color_icon_accent)';
  return (
    <span style={{ display: 'inline-flex', color }}>
      <Icon size={20} />
    </span>
  );
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snack, setSnack] = useState<Snack | null>(null);
  const counterRef = useRef(0);

  const show = useCallback((partial: Omit<Snack, 'key'>) => {
    counterRef.current += 1;
    setSnack({ key: counterRef.current, ...partial });
  }, []);

  const api = useMemo<FeedbackApi>(
    () => ({
      success: (message) => {
        haptic.notify('success');
        show({ variant: 'success', message, duration: DEFAULT_DURATION });
      },
      error: (message) => {
        haptic.notify('error');
        show({ variant: 'error', message, duration: 6000 });
      },
      info: (message) => {
        show({ variant: 'info', message, duration: DEFAULT_DURATION });
      },
      undo: (message, onUndo) => {
        haptic.impact('medium');
        show({
          variant: 'info',
          message,
          duration: DEFAULT_DURATION,
          action: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Undo2 size={16} /> Отменить
            </span>
          ),
          onActionClick: () => {
            haptic.impact('light');
            onUndo();
          },
        });
      },
    }),
    [show],
  );

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {snack && (
        <Snackbar
          key={snack.key}
          before={iconFor(snack.variant)}
          action={snack.action}
          onActionClick={snack.onActionClick}
          duration={snack.duration}
          onClose={() => undefined}
          onClosed={() => setSnack((prev) => (prev?.key === snack.key ? null : prev))}
        >
          {snack.message}
        </Snackbar>
      )}
    </FeedbackContext.Provider>
  );
};
