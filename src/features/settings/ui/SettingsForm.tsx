import React from 'react';
import {
  Banner,
  Button,
  CustomSelect,
  FormItem,
  Group,
  Header,
  Input,
  SimpleCell,
  Slider,
  Subhead,
  Switch,
  Textarea,
} from '@vkontakte/vkui';
import { useForm, Controller, type Resolver, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import { type ChatSettings, ChatSettingsSchema } from '../model/settings.schema';
import { Save } from 'lucide-react';
import { getIsGroupChat } from '@/shared/utils/telegram.util.ts';
import { haptic } from '@/shared/utils/haptic.util';
import { useFeedback } from '@/shared/ui/Feedback/feedback.ts';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
  TABBAR_OFFSET,
} from '@/shared/ui/BottomActionBar/BottomActionBar.tsx';

const ToggleCell: React.FC<{
  control: Control<ChatSettings>;
  name: keyof ChatSettings;
  label: string;
  disabled?: boolean;
}> = ({ control, name, label, disabled }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <SimpleCell
        disabled={disabled}
        after={
          <span style={{ pointerEvents: 'none' }}>
            <Switch checked={!!field.value} disabled={disabled} />
          </span>
        }
        onClick={() => {
          if (disabled) return;
          haptic.impact('light');
          field.onChange(!field.value);
        }}
      >
        {label}
      </SimpleCell>
    )}
  />
);

export const SettingsForm: React.FC<{ initialSettings: ChatSettings; chatId?: number }> = ({
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
      openAiApiKey: '',
    },
  });

  const onSubmit = (data: ChatSettings) => {
    const payload: Partial<ChatSettings> = { ...data };

    if (!payload.openAiApiKey?.trim()) {
      delete payload.openAiApiKey;
    }

    updateSettings(payload, {
      onSuccess: () => {
        feedback.success('Настройки сохранены');
        reset({ ...data, openAiApiKey: '' });
      },
      onError: () => {
        feedback.error('Не удалось сохранить настройки');
      },
    });
  };

  const rawModels: string[] = initialSettings?.availableModels ?? [];
  const modelsOptions: { value: string; label: string; disabled?: boolean }[] = rawModels.map(
    (modelId) => ({ label: modelId, value: modelId }),
  );
  const hasModels = modelsOptions.length > 0;
  const selectPlaceholder = hasModels
    ? 'Выберите модель'
    : 'Нет доступных моделей (проверьте API-ключ)';

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div style={{ paddingBottom: isDirty ? BOTTOM_BAR_CLEARANCE : TABBAR_OFFSET }}>
        <Group mode="card" header={<Header>Грок и OpenAI</Header>}>
          <div style={{ padding: '0 4px 12px' }}>
            <Banner
              mode="tint"
              subtitle={
                <>
                  Общайтесь с ИИ! Бесплатная модель — начните сообщение со слова{' '}
                  <b>«грок ...»</b>. Для мощной модели укажите API-ключ OpenAI, включите тумблер и
                  используйте <b>«чатгпт ...»</b>.
                </>
              }
            />
          </div>

          <Controller
            name="llmSystemPrompt"
            control={control}
            render={({ field }) => (
              <FormItem top="Системный промпт (LLM)">
                <Textarea {...field} placeholder="Ты полезный ассистент." value={field.value || ''} />
              </FormItem>
            )}
          />

          {!getIsGroupChat() && (
            <ToggleCell control={control} name="isStreamingEnabled" label="Потоковый ответ (streaming)" disabled={isPending} />
          )}

          <ToggleCell control={control} name="isOpenAiEnabled" label="Использовать OpenAI" disabled={isPending} />

          <Controller
            name="openAiApiKey"
            control={control}
            render={({ field }) => (
              <FormItem top="API Ключ OpenAI">
                <Input
                  {...field}
                  placeholder={initialSettings?.hasOpenAiApiKey ? '●●●●●●●●●●●●●●●●' : 'sk-...'}
                  type="password"
                />
              </FormItem>
            )}
          />

          <Controller
            name="openAiModel"
            control={control}
            render={({ field }) => (
              <FormItem top="Модель OpenAI">
                <CustomSelect
                  value={field.value}
                  name={field.name}
                  onChange={field.onChange}
                  disabled={!hasModels}
                  placeholder={selectPlaceholder}
                  options={
                    hasModels
                      ? modelsOptions
                      : [{ value: '', label: selectPlaceholder, disabled: true }]
                  }
                />
              </FormItem>
            )}
          />
        </Group>

        <Group mode="card" header={<Header>Балабол</Header>}>
          <div style={{ padding: '0 4px 12px' }}>
            <Banner
              mode="tint"
              subtitle={
                <>
                  «Балабол» — режим, при котором ассистент спонтанно участвует в беседах чата.
                  Настройте вероятность срабатывания и характер общения.
                </>
              }
            />
          </div>

          <ToggleCell control={control} name="isChatterboxEnabled" label="Включить Балабола" disabled={isPending} />

          <Controller
            name="chatterboxSystemPrompt"
            control={control}
            render={({ field }) => (
              <FormItem top="Характер (Системный промпт)">
                <Textarea {...field} placeholder="Ты саркастичный участник чата." value={field.value || ''} />
              </FormItem>
            )}
          />

          <Controller
            name="chatterboxChance"
            control={control}
            render={({ field }) => (
              <FormItem top="Шанс срабатывания">
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
