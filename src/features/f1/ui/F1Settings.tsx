import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Header, Placeholder, SimpleCell, Spinner, Switch } from '@vkontakte/vkui';
import { useState } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import type { z } from 'zod';
import { useGetF1Settings } from '../hooks/useGetF1Settings';
import { useUpdateF1Settings } from '../hooks/useUpdateF1Settings';
import {
  F1_REMINDER_PRESETS,
  f1SettingsSchema,
  type F1Settings as F1SettingsModel,
} from '../model/f1.types';

type F1SettingsInput = z.input<typeof f1SettingsSchema>;

interface ToggleProps {
  name: 'enabled' | 'fullProtocols';
  label: string;
  control: Control<F1SettingsInput>;
  disabled?: boolean;
}

const Toggle = ({ name, label, control, disabled }: ToggleProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <SimpleCell
        disabled={disabled}
        after={
          <Switch
            aria-label={label}
            checked={!!field.value}
            disabled={disabled}
            onChange={(event) => field.onChange(event.target.checked)}
          />
        }
      >
        {label}
      </SimpleCell>
    )}
  />
);

const SettingsForm = ({ initial, chatId }: { initial: F1SettingsModel; chatId: number }) => {
  const [message, setMessage] = useState('');
  const { control, handleSubmit, reset, formState } = useForm<
    F1SettingsInput,
    unknown,
    F1SettingsModel
  >({
    resolver: zodResolver(f1SettingsSchema),
    defaultValues: initial,
  });
  const enabled = useWatch({ control, name: 'enabled' });
  const { mutateAsync } = useUpdateF1Settings(chatId);

  const submit = async (data: F1SettingsModel) => {
    try {
      const saved = await mutateAsync(data);
      reset(saved);
      setMessage('Настройки сохранены');
    } catch {
      setMessage('Не удалось сохранить настройки');
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <Group mode="card" header={<Header>Подписка чата</Header>}>
        <Toggle name="enabled" label="Получать результаты Ф1" control={control} />
        <Toggle
          name="fullProtocols"
          label="Полные протоколы"
          control={control}
          disabled={!enabled}
        />
      </Group>
      <Controller
        name="reminders"
        control={control}
        render={({ field: { value = [], ...field } }) => (
          <Group
            mode="card"
            header={<Header>Напоминания</Header>}
            description="За сколько минут до сессии напомнить в чате"
          >
            <div className="f1-reminders">
              {F1_REMINDER_PRESETS.map((minutes) => {
                const selected = value.includes(minutes);
                return (
                  <Button
                    key={minutes}
                    type="button"
                    mode={selected ? 'primary' : 'outline'}
                    appearance="accent"
                    aria-pressed={selected}
                    disabled={!enabled}
                    onClick={() =>
                      field.onChange(
                        selected ? value.filter((item) => item !== minutes) : [...value, minutes],
                      )
                    }
                  >
                    {minutes} минут
                  </Button>
                );
              })}
            </div>
          </Group>
        )}
      />
      <div className="f1-settings-actions">
        <Button
          type="submit"
          size="l"
          stretched
          disabled={!formState.isDirty || formState.isSubmitting}
        >
          {formState.isSubmitting ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {message && (
          <div role="status" className="f1-form-status">
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

export const F1Settings = ({ chatId }: { chatId?: number }) => {
  const { data, isLoading, isError, refetch } = useGetF1Settings(chatId);

  if (chatId === undefined) {
    return <Placeholder title="Чат не определён">Откройте мини-апп из чата Telegram.</Placeholder>;
  }
  if (isLoading)
    return (
      <div className="f1-loader">
        <Spinner size="l" />
      </div>
    );
  if (isError || !data) {
    return (
      <Group>
        <Placeholder
          title="Ошибка"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        >
          Не удалось загрузить настройки Ф1
        </Placeholder>
      </Group>
    );
  }
  return <SettingsForm initial={data} chatId={chatId} />;
};
