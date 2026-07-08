import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReminderForm } from '@/features/reminders/ui/ReminderForm';
import { useUpdateReminders } from '@/features/reminders/hooks/useUpdateReminders.ts';
import { useCreateReminders } from '@/features/reminders/hooks/useCreateReminders.ts';
import {
  type Reminder,
  type CreateReminderInput,
} from '@/features/reminders/model/reminders.types';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const ReminderFormPage: React.FC = () => {
  const chatId = getChatId();

  const navigate = useNavigate();
  const location = useLocation();

  useTelegramBackButton(() => {
    void navigate('/reminders');
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
      void navigate('/reminders');
    } catch (err) {
      console.error(err);
    }
  };

  return <ReminderForm reminderToEdit={reminderToEdit} onFormSubmit={handleFormSubmit} />;
};
