import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@vkontakte/vkui';
import { ReminderForm } from '@/features/reminders/ui/ReminderForm';
import { ReminderSteamDetails } from '@/features/reminders/ui/ReminderSteamDetails';
import { useUpdateReminders } from '@/features/reminders/hooks/useUpdateReminders.ts';
import { useCreateReminders } from '@/features/reminders/hooks/useCreateReminders.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import type { CreateReminderInput } from '@/features/reminders/model/reminders.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { FormPageState } from '@/shared/ui/FormPageState/FormPageState.tsx';

export const ReminderFormPage: React.FC = () => {
  const chatId = getChatId();
  const navigate = useNavigate();
  const { id } = useParams();
  const feedback = useFeedback();

  const isDirtyRef = useRef(false);
  const [showExitAlert, setShowExitAlert] = useState(false);

  const goBack = useCallback(() => {
    void navigate('/reminders');
  }, [navigate]);

  useTelegramBackButton(() => {
    if (isDirtyRef.current) {
      setShowExitAlert(true);
    } else {
      goBack();
    }
  });

  const { data, isLoading, isError, refetch } = useGetReminders(chatId);
  const reminderToEdit = id ? (data?.find((reminder) => reminder._id === id) ?? null) : null;

  const { mutateAsync: createReminder } = useCreateReminders(chatId);
  const { mutateAsync: editReminder } = useUpdateReminders(chatId);

  const handleFormSubmit = async (formData: CreateReminderInput, entityId?: string) => {
    try {
      if (entityId) {
        await editReminder({ id: entityId, data: formData });
      } else {
        await createReminder(formData);
      }
      isDirtyRef.current = false;
      feedback.success(entityId ? 'Напоминание обновлено' : 'Напоминание создано');
      goBack();
    } catch (err) {
      console.error(err);
      feedback.error('Не удалось сохранить напоминание');
    }
  };

  if (id && (isLoading || isError || !reminderToEdit)) {
    return (
      <FormPageState
        isLoading={isLoading}
        isError={isError}
        notFound={!reminderToEdit}
        entityName="Напоминание"
        onRetry={() => void refetch()}
        onBack={goBack}
      />
    );
  }

  if (reminderToEdit?.kind === 'steam_release') {
    return <ReminderSteamDetails reminder={reminderToEdit} />;
  }

  return (
    <>
      <ReminderForm
        reminderToEdit={reminderToEdit}
        onFormSubmit={handleFormSubmit}
        onDirtyChange={(dirty) => {
          isDirtyRef.current = dirty;
        }}
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
          onClose={() => setShowExitAlert(false)}
          onClosed={() => setShowExitAlert(false)}
        />
      )}
    </>
  );
};
