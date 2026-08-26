import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormItem, Group, Header, Input } from '@vkontakte/vkui';
import { Save, Trash } from 'lucide-react';
import {
  type CreatePlateInput,
  createPlateSchema,
  type Plate,
} from '../model/plates.types.ts';
import { normalizePlate } from '../utils/plateFormat.ts';
import { PlateCard } from './PlateCard.tsx';

interface PlateFormProps {
  plateToEdit: Plate | null;
  onFormSubmit: (data: CreatePlateInput, id?: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  onDelete?: () => void;
}

export const PlateForm: React.FC<PlateFormProps> = ({ plateToEdit, onFormSubmit, onDirtyChange, onDelete }) => {
  const isEditMode = !!plateToEdit;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreatePlateInput>({
    resolver: zodResolver(createPlateSchema),
    defaultValues: { plate: '', name: '' },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    reset(
      plateToEdit
        ? { plate: plateToEdit.plate, name: plateToEdit.name }
        : { plate: '', name: '' },
    );
  }, [plateToEdit, reset]);

  const plateValue = useWatch({ control, name: 'plate' });
  const nameValue = useWatch({ control, name: 'name' });

  const onSubmit = async (data: CreatePlateInput) => {
    try {
      await onFormSubmit({ ...data, plate: normalizePlate(data.plate) }, plateToEdit?._id);
    } catch (err) {
      console.error('Критическая ошибка отправки формы:', err);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div style={{ paddingBottom: 12 }}>
        <PlateCard plate={plateValue || ''} name={nameValue || ''} />
      </div>
      <Group mode="card" header={<Header>{isEditMode ? 'Редактирование' : 'Новый номер'}</Header>}>
        <Controller
          name="plate"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Номер автомобиля"
              status={errors.plate ? 'error' : 'default'}
              bottom={errors.plate?.message ?? 'Российский формат, например А123ВС77'}
            >
              <Input
                {...field}
                placeholder="А123ВС77"
                value={field.value || ''}
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </FormItem>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Имя владельца"
              status={errors.name ? 'error' : 'default'}
              bottom={errors.name?.message}
            >
              <Input {...field} placeholder="Например, Витя" value={field.value || ''} />
            </FormItem>
          )}
        />

        {isEditMode && plateToEdit && (
          <div
            style={{
              padding: '0 16px 16px',
              color: 'var(--vkui--color_text_secondary)',
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            Добавил: {plateToEdit.creatorFirstName}
            {plateToEdit.creatorUsername ? ` (@${plateToEdit.creatorUsername})` : ''}
          </div>
        )}
      </Group>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
        <Button
          size="l"
          stretched
          type="submit"
          loading={isSubmitting}
          before={<Save size={16} />}
        >
          {isEditMode ? 'Сохранить изменения' : 'Добавить'}
        </Button>
        {isEditMode && onDelete && (
          <Button
            size="l"
            stretched
            mode="secondary"
            appearance="negative"
            before={<Trash size={16} />}
            onClick={onDelete}
          >
            Удалить номер
          </Button>
        )}
      </div>
    </form>
  );
};
