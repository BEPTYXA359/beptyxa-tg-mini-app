import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CustomSelect,
  FormItem,
  Group,
  Header,
  Input,
  Placeholder,
  Slider,
  Spinner,
  Subhead,
  Textarea,
} from '@vkontakte/vkui';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useGetSettings } from '@/features/settings';
import {
  useUpdateSettings,
  type UpdateSettingsPayload,
} from '@/features/settings/hooks/useUpdateSettings';
import {
  ChatSettingsSchema,
  MAX_CHATTERBOX_TRIGGER_LENGTH,
  MAX_SYSTEM_PROMPT_LENGTH,
  type ChatSettings,
} from '@/features/settings/model/settings.schema';
import { LLM_PROVIDERS_META } from '@/features/settings/model/providers.meta';
import { isProviderConnected } from '@/features/settings/model/provider-settings';
import { ToggleCell } from '@/features/settings/ui/ToggleCell';
import { getChatId } from '@/shared/utils/telegram.util';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';
import { useFeedback } from '@/shared/ui/Feedback/feedback';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
  TABBAR_OFFSET,
} from '@/shared/ui/BottomActionBar/BottomActionBar';

const ChatterboxSettingsForm: React.FC<{ initialSettings: ChatSettings; chatId?: number }> = ({
  initialSettings,
  chatId,
}) => {
  const feedback = useFeedback();
  const { mutate: updateSettings, isPending } = useUpdateSettings(chatId);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ChatSettings>({
    resolver: zodResolver(ChatSettingsSchema) as Resolver<ChatSettings>,
    defaultValues: {
      ...initialSettings,
      chatterboxChance: initialSettings.chatterboxChance || 0,
      chatterboxTrigger: initialSettings.chatterboxTrigger ?? '',
      chatterboxProvider: initialSettings.chatterboxProvider ?? '',
    },
  });

  const onSubmit = (data: ChatSettings) => {
    const trigger = data.chatterboxTrigger?.trim() ?? '';
    const payload: UpdateSettingsPayload = {
      isChatterboxEnabled: data.isChatterboxEnabled,
      chatterboxSystemPrompt: data.chatterboxSystemPrompt ?? '',
      chatterboxChance: data.chatterboxChance,
      chatterboxTrigger: trigger,
      // '' = сброс на дефолтного провайдера (Groq)
      chatterboxProvider: data.chatterboxProvider?.trim() ?? '',
    };

    updateSettings(payload, {
      onSuccess: () => {
        feedback.success('Настройки сохранены');
        reset({ ...data, chatterboxTrigger: trigger });
      },
      onError: () => {
        feedback.error('Не удалось сохранить настройки');
      },
    });
  };

  // Выбирать можно только среди подключённых провайдеров (Groq всегда доступен)
  const providerOptions = useMemo(
    () =>
      LLM_PROVIDERS_META.filter((meta) => isProviderConnected(initialSettings, meta.id)).map(
        (meta) => ({ label: meta.label, value: meta.id }),
      ),
    [initialSettings],
  );

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div style={{ paddingBottom: isDirty ? BOTTOM_BAR_CLEARANCE : TABBAR_OFFSET }}>
        <Group
          mode="card"
          header={<Header>Балабол</Header>}
          description="Спонтанно вмешивается в разговоры чата, отвечает на «<слово> <фраза>» и на реплаи на свои сообщения"
        >
          <ToggleCell
            control={control}
            name="isChatterboxEnabled"
            label="Включить Балабола"
            disabled={isPending}
          />

          <Controller
            name="chatterboxProvider"
            control={control}
            render={({ field }) => {
              const value = field.value ?? '';
              // Сохранённый провайдер мог отключиться (ключ удалён) — не теряем выбор
              const options =
                value && !providerOptions.some((option) => option.value === value)
                  ? [
                      {
                        label: `${
                          LLM_PROVIDERS_META.find((meta) => meta.id === value)?.label ?? value
                        } (ключ удалён)`,
                        value,
                      },
                      ...providerOptions,
                    ]
                  : providerOptions;

              return (
                <FormItem
                  top="Провайдер"
                  bottom="Мозг Балабола. По умолчанию Groq — бесплатный, ключ не нужен"
                >
                  <CustomSelect
                    value={value}
                    name={field.name}
                    onChange={field.onChange}
                    placeholder="Groq (по умолчанию)"
                    options={options}
                    allowClearButton
                  />
                </FormItem>
              );
            }}
          />

          <Controller
            name="chatterboxTrigger"
            control={control}
            render={({ field, fieldState }) => (
              <FormItem
                top="Слово призыва"
                status={fieldState.error ? 'error' : undefined}
                bottom={
                  fieldState.error?.message ??
                  '«балабол <фраза>» — Балабол ответит сразу, не дожидаясь своего шанса. Пусто — «балабол». Слова-триггеры провайдеров («грок», «чатгпт»…) перехватываются раньше вызова.'
                }
              >
                <Input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={MAX_CHATTERBOX_TRIGGER_LENGTH}
                  placeholder="балабол"
                />
              </FormItem>
            )}
          />
        </Group>

        <Group mode="card" header={<Header>Характер</Header>}>
          <Controller
            name="chatterboxSystemPrompt"
            control={control}
            render={({ field }) => (
              <FormItem top="Системный промпт">
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  maxLength={MAX_SYSTEM_PROMPT_LENGTH}
                  placeholder="Ты саркастичный участник чата. Отвечай коротко и смешно."
                />
              </FormItem>
            )}
          />

          <Controller
            name="chatterboxChance"
            control={control}
            render={({ field }) => (
              <FormItem top="Шанс спонтанной реплики">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Subhead weight="2">{Math.round((field.value || 0) * 100)}%</Subhead>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round((field.value || 0) * 100)}
                    onChange={(value) => {
                      field.onChange(value / 100);
                    }}
                  />
                </div>
              </FormItem>
            )}
          />
        </Group>
      </div>

      {isDirty && (
        <BottomActionBar>
          <Button size="l" stretched loading={isPending} type="submit" before={<Save size={16} />}>
            Сохранить изменения
          </Button>
        </BottomActionBar>
      )}
    </form>
  );
};

export const ChatterboxSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  useTelegramBackButton(() => {
    void navigate('/settings');
  });

  const chatId = getChatId();
  const { data: settings, isLoading, isError } = useGetSettings(chatId);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <Group>
        <Placeholder title="Ошибка">Не удалось загрузить настройки.</Placeholder>
      </Group>
    );
  }

  return <ChatterboxSettingsForm initialSettings={settings} chatId={chatId} />;
};
