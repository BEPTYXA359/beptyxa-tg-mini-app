import React, { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@vkontakte/vkui';
import { ReminderForm } from '@/features/reminders/ui/ReminderForm';
import { ReminderSteamDetails } from '@/features/reminders/ui/ReminderSteamDetails';
import { useUpdateReminders } from '@/features/reminders/hooks/useUpdateReminders.ts';
import { useCreateReminders } from '@/features/reminders/hooks/useCreateReminders.ts';
import {
  type Reminder,
  type CreateReminderInput,
} from '@/features/reminders/model/reminders.types';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';

export const ReminderFormPage: React.FC = () => {
  const chatId = getChatId();

  const navigate = useNavigate();
  const location = useLocation();
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

  const state = location.state as { reminder?: Reminder } | null;
  const reminderToEdit = state?.reminder ?? null;

  const { mutateAsync: createReminder } = useCreateReminders(chatId);
  const { mutateAsync: editReminder } = useUpdateReminders(chatId);

  const handleFormSubmit = async (data: CreateReminderInput, id?: string) => {
    try {
      if (id) {
        await editReminder({ id, data });
      } else {
        await createReminder(data);
      }
      isDirtyRef.current = false;
      feedback.success(id ? 'Напоминание обновлено' : 'Напоминание создано');
      goBack();
    } catch (err) {
      console.error(err);
      feedback.error('Не удалось сохранить напоминание');
    }
  };

  // Напоминания о выходе игры нельзя редактировать — показываем только просмотр
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
