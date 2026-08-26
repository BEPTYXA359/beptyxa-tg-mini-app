import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormItem, Group, Header, Input } from '@vkontakte/vkui';
import { Save } from 'lucide-react';
import {
  type CreatePlateInput,
  createPlateSchema,
  type Plate,
} from '../model/plates.types.ts';
import { normalizePlate, parsePlateParts } from '../utils/plateFormat.ts';
import { PlateNumber } from './PlateNumber.tsx';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
} from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

interface PlateFormProps {
  plateToEdit: Plate | null;
  onFormSubmit: (data: CreatePlateInput, id?: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const PlateForm: React.FC<PlateFormProps> = ({ plateToEdit, onFormSubmit, onDirtyChange }) => {
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
  const isPlateParsed = parsePlateParts(plateValue || '') !== null;

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
      <div style={{ paddingBottom: BOTTOM_BAR_CLEARANCE }}>
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

          {isPlateParsed && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
              <PlateNumber plate={plateValue || ''} size="m" />
            </div>
          )}
        </Group>
      </div>

      <BottomActionBar>
        <Button
          size="l"
          stretched
          loading={isSubmitting}
          type="submit"
          before={<Save size={16} />}
        >
          {isEditMode ? 'Сохранить изменения' : 'Добавить'}
        </Button>
      </BottomActionBar>
    </form>
  );
};
