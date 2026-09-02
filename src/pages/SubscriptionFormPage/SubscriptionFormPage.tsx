import React, { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@vkontakte/vkui';
import { isAxiosError } from 'axios';
import { SubscriptionForm } from '@/features/subscriptions/ui/SubscriptionForm.tsx';
import { useUpdateSubscription } from '@/features/subscriptions/hooks/useUpdateSubscription.ts';
import { useCreateSubscription } from '@/features/subscriptions/hooks/useCreateSubscription.ts';
import { useUndoDeleteSubscription } from '@/features/subscriptions/hooks/useUndoDeleteSubscription.ts';
import type {
  Subscription,
  SubscriptionPayload,
} from '@/features/subscriptions/model/subscriptions.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

export const SubscriptionFormPage: React.FC = () => {
  const chatId = getChatId();

  const navigate = useNavigate();
  const location = useLocation();
  const feedback = useFeedback();

  const isDirtyRef = useRef(false);
  const [showExitAlert, setShowExitAlert] = useState(false);

  const goBack = useCallback(() => {
    void navigate('/subscriptions');
  }, [navigate]);

  useTelegramBackButton(() => {
    if (isDirtyRef.current) {
      setShowExitAlert(true);
    } else {
      goBack();
    }
  });

  const state = location.state as { subscription?: Subscription } | null;
  const subscriptionToEdit = state?.subscription ?? null;

  const { mutateAsync: createSubscription } = useCreateSubscription(chatId);
  const { mutateAsync: editSubscription } = useUpdateSubscription(chatId);
  const deleteWithUndo = useUndoDeleteSubscription(chatId);

  const handleFormSubmit = async (data: SubscriptionPayload, id?: string) => {
    try {
      if (id) {
        await editSubscription({ id, data });
      } else {
        await createSubscription(data);
      }
      isDirtyRef.current = false;
      feedback.success(id ? 'Подписка обновлена' : 'Подписка добавлена');
      goBack();
    } catch (err) {
      if (isAxiosError<{ error: string }>(err) && err.response?.data?.error) {
        feedback.error(err.response.data.error);
        return;
      }
      console.error(err);
      feedback.error('Не удалось сохранить подписку');
    }
  };

  const handleDelete = useCallback(() => {
    if (!subscriptionToEdit) return;
    isDirtyRef.current = false;
    deleteWithUndo(subscriptionToEdit._id);
    goBack();
  }, [subscriptionToEdit, deleteWithUndo, goBack]);

  return (
    <>
      <SubscriptionForm
        subscriptionToEdit={subscriptionToEdit}
        onFormSubmit={handleFormSubmit}
        onDirtyChange={(dirty) => {
          isDirtyRef.current = dirty;
        }}
        onDelete={subscriptionToEdit ? handleDelete : undefined}
      />

      {showExitAlert && (
        <Alert
          title="Уйти без сохранения?"
          description="Внесённые изменения будут потеряны."
          actionsLayout="horizontal"
          actions={[
            {
              title: 'Остаться',
              mode: 'cancel',
            },
            {
              title: 'Уйти',
              mode: 'destructive',
              autoCloseDisabled: true,
              action: () => {
                isDirtyRef.current = false;
                setShowExitAlert(false);
                goBack();
              },
            },
          ]}
          onClosed={() => setShowExitAlert(false)}
        />
      )}
    </>
  );
};
