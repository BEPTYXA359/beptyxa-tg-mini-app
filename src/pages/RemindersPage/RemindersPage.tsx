import React, { useState } from 'react';
import { Button, FixedLayout, List, Placeholder, Spinner } from '@telegram-apps/telegram-ui';
import { RemindersList } from '@/features/reminders/ui/RemindersList';
import { useDeleteReminders } from '@/features/reminders/hooks/useDeleteReminders.ts';
import { useGetReminders } from '@/features/reminders/hooks/useGetReminders.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import type { Reminder } from '@/features/reminders/model/reminders.types.ts';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '@/features/reminders/ui/DeleteConfirmationModal.tsx';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/');
  });

  const chatId = getChatId();

  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  const { data: reminders = [], isLoading, isError } = useGetReminders(chatId);
  const { mutate: deleteReminder } = useDeleteReminders(chatId);

  const handleOpenEdit = (reminder: Reminder) => {
    void navigate('/reminders/form', { state: { reminder } });
  };

  const handleDeleteConfirm = () => {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete._id);
      setReminderToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner size="l" />
      </div>
    );
  }
  if (isError) {
    return <Placeholder header="Ошибка" description="Не удалось загрузить напоминания" />;
  }

  return (
    <List
      style={{ background: 'var(--tgui--secondary_bg_color)', paddingBottom: 66, height: '100%' }}
    >
      <div style={{ paddingBottom: '80px' }}>
        <RemindersList
          items={reminders}
          onDelete={(id) => setReminderToDelete(reminders.find((r) => r._id === id) || null)}
          onEdit={handleOpenEdit}
        />
      </div>

      <DeleteConfirmationModal
        isOpen={!!reminderToDelete}
        onClose={() => setReminderToDelete(null)}
        onConfirm={handleDeleteConfirm}
        reminderMessage={reminderToDelete?.message || ''}
      />

      <FixedLayout
        vertical="bottom"
        style={{
          padding: '8px 8px 90px 8px',
        }}
      >
        <Button size="l" stretched onClick={() => void navigate('/reminders/form')}>
          + Добавить напоминание
        </Button>
      </FixedLayout>
    </List>
  );
};
