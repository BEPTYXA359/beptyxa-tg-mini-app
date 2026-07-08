import React from 'react';
import { Modal, Button, Text } from '@telegram-apps/telegram-ui';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reminderMessage: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reminderMessage,
}) => {
  return (
    <Modal
      header={<ModalHeader>Удаление напоминания</ModalHeader>}
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <div style={{ padding: '16px 24px', textAlign: 'center' }}>
        <Text weight="1" style={{ display: 'block', marginBottom: '16px' }}>
          Вы уверены, что хотите удалить напоминание:
          <span
            style={{
              color: 'var(--tgui--accent_text_color)',
              display: 'inline-block',
              marginLeft: '4px',
            }}
          >
            "{reminderMessage}"
          </span>
          ?
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
          <Button
            mode="filled"
            size="l"
            stretched
            onClick={onConfirm}
            style={{
              backgroundColor: 'var(--tg-theme-destructive-text-color)',
              color: 'var(--tgui--button_text_color)',
            }}
          >
            Да, удалить
          </Button>
          <Button mode="plain" size="l" stretched onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
};
