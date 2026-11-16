import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@vkontakte/vkui';
import { isAxiosError } from 'axios';
import { PlateForm } from '@/features/plates/ui/PlateForm.tsx';
import { useUpdatePlate } from '@/features/plates/hooks/useUpdatePlate.ts';
import { useCreatePlate } from '@/features/plates/hooks/useCreatePlate.ts';
import { useUndoDeletePlate } from '@/features/plates/hooks/useUndoDeletePlate.ts';
import { useGetPlates } from '@/features/plates/hooks/useGetPlates.ts';
import type { CreatePlateInput } from '@/features/plates/model/plates.types.ts';
import { getChatId } from '@/shared/utils/telegram.util.ts';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton.ts';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import { FormPageState } from '@/shared/ui/FormPageState/FormPageState.tsx';

export const PlateFormPage: React.FC = () => {
  const chatId = getChatId();
  const navigate = useNavigate();
  const { id } = useParams();
  const feedback = useFeedback();

  const isDirtyRef = useRef(false);
  const [showExitAlert, setShowExitAlert] = useState(false);

  const goBack = useCallback(() => {
    void navigate('/plates');
  }, [navigate]);

  useTelegramBackButton(() => {
    if (isDirtyRef.current) {
      setShowExitAlert(true);
    } else {
      goBack();
    }
  });

  const { data, isLoading, isError, refetch } = useGetPlates(chatId);
  const plateToEdit = id ? (data?.find((plate) => plate._id === id) ?? null) : null;

  const { mutateAsync: createPlate } = useCreatePlate(chatId);
  const { mutateAsync: editPlate } = useUpdatePlate(chatId);
  const deleteWithUndo = useUndoDeletePlate(chatId);

  const handleFormSubmit = async (formData: CreatePlateInput, entityId?: string) => {
    try {
      if (entityId) {
        await editPlate({ id: entityId, data: formData });
      } else {
        await createPlate(formData);
      }
      isDirtyRef.current = false;
      feedback.success(entityId ? 'Номер обновлён' : 'Номер добавлен');
      goBack();
    } catch (err) {
      if (isAxiosError<{ error: string }>(err) && err.response?.data?.error) {
        feedback.error(err.response.data.error);
        return;
      }
      console.error(err);
      feedback.error('Не удалось сохранить номер');
    }
  };

  const handleDelete = useCallback(() => {
    if (!plateToEdit) return;
    isDirtyRef.current = false;
    deleteWithUndo(plateToEdit._id);
    goBack();
  }, [plateToEdit, deleteWithUndo, goBack]);

  if (id && (isLoading || isError || !plateToEdit)) {
    return (
      <FormPageState
        isLoading={isLoading}
        isError={isError}
        notFound={!plateToEdit}
        entityName="Номер"
        onRetry={() => void refetch()}
        onBack={goBack}
      />
    );
  }

  return (
    <>
      <PlateForm
        plateToEdit={plateToEdit}
        onFormSubmit={handleFormSubmit}
        onDirtyChange={(dirty) => {
          isDirtyRef.current = dirty;
        }}
        onDelete={plateToEdit ? handleDelete : undefined}
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
