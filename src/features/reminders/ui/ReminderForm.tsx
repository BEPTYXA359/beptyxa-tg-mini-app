import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Select,
  Button,
  Section,
  List,
  FixedLayout,
  Textarea,
  Cell,
  Switch,
} from '@telegram-apps/telegram-ui';
import {
  type CreateReminderInput,
  createReminderSchema,
  type FrequencyType,
  type Reminder,
} from '../model/reminders.types';
import { Save } from 'lucide-react';
import { DaysOfWeekPicker } from '@/features/reminders/ui/DaysOfWeekPicker.tsx';

interface ReminderFormProps {
  reminderToEdit: Reminder | null;
  onFormSubmit: (data: CreateReminderInput, id?: string) => Promise<void>;
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

export const ReminderForm: React.FC<ReminderFormProps> = ({ reminderToEdit, onFormSubmit }) => {
  const isEditMode = !!reminderToEdit;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
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
      <List style={{ paddingBottom: 66 }}>
        <Section header={isEditMode ? 'Редактирование напоминания' : 'Параметры напоминания'}>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                header="Что напомнить"
                placeholder="Введите текст сообщения..."
                status={errors.message ? 'error' : undefined}
              />
            )}
          />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                header="Периодичность"
                onChange={(e) => handleFrequencyChange(e, field.onChange)}
              >
                <option value="once">Один раз</option>
                <option value="daily">Каждый день</option>
                <option value="every_other_day">Через день</option>
                <option value="specific_days">По выбранным дням</option>
              </Select>
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <Input
                key={currentFrequency === 'once' ? 'datetime-node-stable' : 'time-node-stable'}
                {...field}
                header="Время"
                type={currentFrequency === 'once' ? 'datetime-local' : 'time'}
                status={errors.time ? 'error' : undefined}
              />
            )}
          />
        </Section>

        {currentFrequency === 'specific_days' && (
          <DaysOfWeekPicker selectedDays={currentSpecificDays} onToggle={handleDayToggle} />
        )}

        <Controller
          name="silent"
          control={control}
          render={({ field }) => (
            <Cell
              Component="label"
              after={
                <Switch checked={!!field.value} onChange={field.onChange} />
              }
            >
              Не упоминать в чате
            </Cell>
          )}
        />
      </List>

      <FixedLayout vertical="bottom" style={{ padding: '8px 8px 90px 8px' }}>
        <Button
          size="l"
          stretched
          loading={isSubmitting}
          type="submit"
          before={<Save size={16} color="var(--tgui--button_text_color)" />}
        >
          {isEditMode ? 'Сохранить изменения' : 'Создать'}
        </Button>
      </FixedLayout>
    </form>
  );
};
