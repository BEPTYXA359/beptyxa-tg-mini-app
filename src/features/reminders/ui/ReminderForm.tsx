import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CustomSelect,
  FormItem,
  Group,
  Header,
  Input,
  SimpleCell,
  Switch,
  Textarea,
} from '@vkontakte/vkui';
import {
  type CreateReminderInput,
  createReminderSchema,
  type FrequencyType,
  type Reminder,
} from '../model/reminders.types';
import { Save } from 'lucide-react';
import { DaysOfWeekPicker } from '@/features/reminders/ui/DaysOfWeekPicker.tsx';
import { haptic } from '@/shared/utils/haptic.util';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
} from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

interface ReminderFormProps {
  reminderToEdit: Reminder | null;
  onFormSubmit: (data: CreateReminderInput, id?: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

const getInitialDateTimeLocal = (): string => {
  const now = new Date();
  const today = now.toLocaleDateString('en-CA');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${today}T${hours}:${minutes}`;
};

const convertIsoToDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const today = date.toLocaleDateString('en-CA');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${today}T${hours}:${minutes}`;
};

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ReminderForm: React.FC<ReminderFormProps> = ({ reminderToEdit, onFormSubmit, onDirtyChange }) => {
  const isEditMode = !!reminderToEdit;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateReminderInput>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: {
      message: '',
      frequency: 'once',
      time: getInitialDateTimeLocal(),
      specificDays: [],
      silent: false,
    },
  });

  const currentFrequency = useWatch({ control, name: 'frequency' });
  const currentSpecificDays = useWatch({ control, name: 'specificDays' }) || [];

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (reminderToEdit) {
      reset({
        message: reminderToEdit.message,
        frequency: reminderToEdit.frequency,
        time:
          reminderToEdit.frequency === 'once'
            ? convertIsoToDateTimeLocal(reminderToEdit.time)
            : reminderToEdit.time,
        specificDays: reminderToEdit.specificDays || [],
        silent: reminderToEdit.silent === true,
      });
    } else {
      reset({ message: '', frequency: 'once', time: getInitialDateTimeLocal(), specificDays: [], silent: false });
    }
  }, [reminderToEdit, reset]);

  const handleFrequencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    formOnChange: (...event: React.ChangeEvent<HTMLSelectElement>[]) => void,
  ) => {
    const nextFrequency = event.target.value as FrequencyType;

    formOnChange(event);

    if (nextFrequency !== 'specific_days') {
      setValue('specificDays', [], { shouldDirty: true });
    }

    const currentTime = getValues('time');
    if (!currentTime) return;

    const hasDatePart = currentTime.includes('T');

    if (nextFrequency === 'once' && !hasDatePart) {
      const today = new Date().toLocaleDateString('en-CA');
      setValue('time', `${today}T${currentTime}`, { shouldDirty: true });
    } else if (nextFrequency !== 'once' && hasDatePart) {
      const timePart = currentTime.split('T')[1]?.slice(0, 5);
      if (timePart) {
        setValue('time', timePart, { shouldDirty: true });
      }
    }
  };

  const handleDayToggle = (dayValue: number) => {
    const updatedDays = currentSpecificDays.includes(dayValue)
      ? currentSpecificDays.filter((d) => d !== dayValue)
      : [...currentSpecificDays, dayValue];

    setValue('specificDays', updatedDays, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: CreateReminderInput) => {
    try {
      const payload: CreateReminderInput = {
        ...data,
        time: data.frequency === 'once' ? new Date(data.time).toISOString() : data.time,
        specificDays: data.frequency === 'specific_days' ? data.specificDays : undefined,
        timezone: userTimezone,
        silent: data.silent === true,
      };

      await onFormSubmit(payload, reminderToEdit?._id);
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
        <Group mode="card" header={<Header>{isEditMode ? 'Редактирование' : 'Параметры'}</Header>}>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <FormItem
                top="Что напомнить"
                status={errors.message ? 'error' : 'default'}
                bottom={errors.message?.message}
              >
                <Textarea {...field} placeholder="Введите текст сообщения..." value={field.value || ''} />
              </FormItem>
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <FormItem top="Периодичность">
                <CustomSelect
                  value={field.value}
                  name={field.name}
                  onChange={(e) => handleFrequencyChange(e, field.onChange)}
                  options={[
                    { value: 'once', label: 'Один раз' },
                    { value: 'daily', label: 'Каждый день' },
                    { value: 'every_other_day', label: 'Через день' },
                    { value: 'specific_days', label: 'По выбранным дням' },
                  ]}
                />
              </FormItem>
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <FormItem
                top="Время"
                status={errors.time ? 'error' : 'default'}
                bottom={errors.time?.message}
              >
                <Input
                  key={currentFrequency === 'once' ? 'datetime-node-stable' : 'time-node-stable'}
                  {...field}
                  type={currentFrequency === 'once' ? 'datetime-local' : 'time'}
                />
              </FormItem>
            )}
          />
        </Group>

        {currentFrequency === 'specific_days' && (
          <DaysOfWeekPicker selectedDays={currentSpecificDays} onToggle={handleDayToggle} />
        )}

        <Group mode="card">
          <Controller
            name="silent"
            control={control}
            render={({ field }) => (
              <SimpleCell
                after={
                  <span style={{ pointerEvents: 'none' }}>
                    <Switch checked={!!field.value} />
                  </span>
                }
                onClick={() => {
                  haptic.impact('light');
                  field.onChange(!field.value);
                }}
              >
                Не упоминать в чате
              </SimpleCell>
            )}
          />
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
          {isEditMode ? 'Сохранить изменения' : 'Создать'}
        </Button>
      </BottomActionBar>
    </form>
  );
};
