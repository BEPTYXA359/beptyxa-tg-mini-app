import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@vkontakte/vkui';
import { isAxiosError } from 'axios';
import { SubscriptionForm } from '@/features/subscriptions/ui/SubscriptionForm.tsx';
import { useUpdateSubscription } from '@/features/subscriptions/hooks/useUpdateSubscription.ts';
import { useCreateSubscription } from '@/features/subscriptions/hooks/useCreateSubscription.ts';
import { useUndoDeleteSubscription } from '@/features/subscriptions/hooks/useUndoDeleteSubscription.ts';
import { useGetSubscriptions } from '@/features/subscriptions/hooks/useGetSubscriptions.ts';
import type { SubscriptionPayload } from '@/features/subscriptions/model/subscriptions.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { FormPageState } from '@/shared/ui/FormPageState/FormPageState.tsx';

export const SubscriptionFormPage: React.FC = () => {
  const chatId = getChatId();
  const navigate = useNavigate();
  const { id } = useParams();
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

  const { data, isLoading, isError, refetch } = useGetSubscriptions(chatId);
  const subscriptionToEdit = id
    ? (data?.find((subscription) => subscription._id === id) ?? null)
    : null;

  const { mutateAsync: createSubscription } = useCreateSubscription(chatId);
  const { mutateAsync: editSubscription } = useUpdateSubscription(chatId);
  const deleteWithUndo = useUndoDeleteSubscription(chatId);

  const handleFormSubmit = async (formData: SubscriptionPayload, entityId?: string) => {
    try {
      if (entityId) {
        await editSubscription({ id: entityId, data: formData });
      } else {
        await createSubscription(formData);
      }
      isDirtyRef.current = false;
      feedback.success(entityId ? 'Подписка обновлена' : 'Подписка добавлена');
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

  if (id && (isLoading || isError || !subscriptionToEdit)) {
    return (
      <FormPageState
        isLoading={isLoading}
        isError={isError}
        notFound={!subscriptionToEdit}
        entityName="Подписка"
        onRetry={() => void refetch()}
        onBack={goBack}
      />
    );
  }

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
