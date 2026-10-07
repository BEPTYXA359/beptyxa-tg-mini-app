import React from 'react';
import {
  Banner,
  Button,
  CustomSelect,
  FormItem,
  Group,
  Header,
  Input,
  Separator,
  SimpleCell,
  Slider,
  Subhead,
  Switch,
  Textarea,
} from '@vkontakte/vkui';
import { useForm, Controller, type Resolver, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateSettings, type UpdateSettingsPayload } from '../hooks/useUpdateSettings';
import {
  type ChatSettings,
  type LlmProviderPatch,
  ChatSettingsSchema,
  MAX_SYSTEM_PROMPT_LENGTH,
  MAX_ALIAS_LENGTH,
} from '../model/settings.schema';
import { LLM_PROVIDERS_META, type LlmProviderMeta } from '../model/providers.meta';
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

const providerPath = (
  meta: LlmProviderMeta,
  field: 'apiKey' | 'model' | 'alias',
): `providers.${string}.${'apiKey' | 'model' | 'alias'}` => `providers.${meta.id}.${field}`;

const ProviderBlock: React.FC<{
  control: Control<ChatSettings>;
  meta: LlmProviderMeta;
  models?: string[];
  hasApiKey?: boolean;
}> = ({ control, meta, models, hasApiKey }) => {
  const modelOptions = (models ?? []).map((modelId) => ({ label: modelId, value: modelId }));

  return (
    <>
      {meta.hasApiKeyField && (
        <Controller
          name={providerPath(meta, 'apiKey')}
          control={control}
          render={({ field }) => (
            <FormItem
              top="API ключ"
              bottom={hasApiKey ? 'Ключ уже сохранён — введите новый, чтобы заменить' : undefined}
            >
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={hasApiKey ? '●●●●●●●●●●●●' : (meta.keyPlaceholder ?? 'API ключ')}
                type="password"
              />
            </FormItem>
          )}
        />
      )}

      {meta.hasApiKeyField && (
        <Controller
          name={providerPath(meta, 'model')}
          control={control}
          render={({ field }) => {
            const value = field.value ?? '';
            // Сохранённая модель может отсутствовать в списке (обрезан, переименован) — не теряем её
            const options =
              value && !modelOptions.some((option) => option.value === value)
                ? [{ label: value, value }, ...modelOptions]
                : modelOptions;

            return modelOptions.length > 0 ? (
              <FormItem top="Модель">
                <CustomSelect
                  value={value}
                  name={field.name}
                  onChange={field.onChange}
                  placeholder="Выберите модель"
                  options={options}
                />
              </FormItem>
            ) : (
              <FormItem top="Модель">
                <Input
                  {...field}
                  value={value}
                  placeholder={`напр. ${meta.defaultModel ?? 'model-id'}`}
                />
              </FormItem>
            );
          }}
        />
      )}

      <Controller
        name={providerPath(meta, 'alias')}
        control={control}
        render={({ field }) => (
          <FormItem
            top="Своё слово-триггер"
            bottom={`Вместо «${meta.defaultTrigger}». Пусто — стандартные слова`}
          >
            <Input
              {...field}
              value={field.value ?? ''}
              maxLength={MAX_ALIAS_LENGTH}
              placeholder={meta.defaultTrigger}
            />
          </FormItem>
        )}
      />
    </>
  );
};

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
      providers: Object.fromEntries(
        LLM_PROVIDERS_META.map((meta) => {
          const stored = initialSettings.providers?.[meta.id];
          return [
            meta.id,
            {
              hasApiKey: stored?.hasApiKey ?? false,
              apiKey: '',
              model: stored?.model ?? '',
              alias: stored?.alias ?? '',
            },
          ];
        }),
      ),
    },
  });

  const onSubmit = (data: ChatSettings) => {
    // Собираем payload явно: сервисные поля (providers/providerModels/…) не уезжают на сервер
    const payload: UpdateSettingsPayload = {
      isOpenAiEnabled: data.isOpenAiEnabled,
      isChatterboxEnabled: data.isChatterboxEnabled,
      isStreamingEnabled: data.isStreamingEnabled,
      llmSystemPrompt: data.llmSystemPrompt,
      chatterboxSystemPrompt: data.chatterboxSystemPrompt,
      openAiModel: data.openAiModel,
      chatterboxChance: data.chatterboxChance,
    };

    if (data.openAiApiKey?.trim()) {
      payload.openAiApiKey = data.openAiApiKey;
    }

    const llmProviders: Record<string, LlmProviderPatch> = {};
    for (const meta of LLM_PROVIDERS_META) {
      const entry = data.providers?.[meta.id];
      if (!entry) continue;

      const patch: LlmProviderPatch = {};
      if (meta.hasApiKeyField && meta.id !== 'OpenAi') {
        // ключ и модель OpenAI живут в отдельных полях openAiApiKey/openAiModel
        if (entry.apiKey?.trim()) {
          patch.apiKey = entry.apiKey.trim();
        }
        patch.model = entry.model?.trim() ?? '';
      }
      patch.alias = entry.alias?.trim() ?? '';
      llmProviders[meta.id] = patch;
    }
    payload.llmProviders = llmProviders;

    updateSettings(payload, {
      onSuccess: () => {
        feedback.success('Настройки сохранены');
        reset({
          ...data,
          openAiApiKey: '',
          providers: Object.fromEntries(
            Object.entries(data.providers ?? {}).map(([id, entry]) => [id, { ...entry, apiKey: '' }]),
          ),
        });
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

  const keyProviders = LLM_PROVIDERS_META.filter((meta) => meta.id !== 'OpenAi');
  const groqMeta = keyProviders.find((meta) => meta.id === 'Groq');
  const otherProviders = keyProviders.filter((meta) => meta.id !== 'Groq');

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div style={{ paddingBottom: isDirty ? BOTTOM_BAR_CLEARANCE : TABBAR_OFFSET }}>
        <Group mode="card" header={<Header>AI-провайдеры</Header>}>
          <div style={{ padding: '0 4px 12px' }}>
            <Banner
              mode="tint"
              subtitle={
                <>
                  Начните сообщение со слова-триггера: <b>«грок ...»</b> (бесплатно),{' '}
                  <b>«чатгпт ...»</b> (OpenAI), <b>«глм ...»</b>, <b>«дипсик ...»</b>,{' '}
                  <b>«гемини ...»</b>, <b>«клод ...»</b>, <b>«grok ...»</b>,{' '}
                  <b>«опенроутер ...»</b>. Любое слово можно заменить на своё ниже.
                </>
              }
            />
          </div>

          <Controller
            name="llmSystemPrompt"
            control={control}
            render={({ field }) => (
              <FormItem top="Системный промпт (LLM)">
                <Textarea
                  {...field}
                  maxLength={MAX_SYSTEM_PROMPT_LENGTH}
                  placeholder="Ты полезный ассистент."
                  value={field.value || ''}
                />
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
            render={({ field }) => {
              const value = field.value;
              const options =
                value && !modelsOptions.some((option) => option.value === value)
                  ? [{ label: value, value }, ...modelsOptions]
                  : modelsOptions;

              return (
                <FormItem top="Модель OpenAI">
                  <CustomSelect
                    value={value}
                    name={field.name}
                    onChange={field.onChange}
                    disabled={!hasModels && !value}
                    placeholder={selectPlaceholder}
                    options={
                      options.length > 0
                        ? options
                        : [{ value: '', label: selectPlaceholder, disabled: true }]
                    }
                  />
                </FormItem>
              );
            }}
          />

          <Controller
            name="providers.OpenAi.alias"
            control={control}
            render={({ field }) => (
              <FormItem
                top="Своё слово-триггер OpenAI"
                bottom={`Вместо «чатгпт». Пусто — стандартные слова`}
              >
                <Input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={MAX_ALIAS_LENGTH}
                  placeholder="чатгпт"
                />
              </FormItem>
            )}
          />
        </Group>

        <Group mode="card" header={<Header>Другие провайдеры</Header>}>
          <div style={{ padding: '0 4px 12px' }}>
            <Banner
              mode="tint"
              subtitle={
                <>
                  Провайдеры ниже работают по вашему API-ключу (кроме бесплатного Groq). Модель
                  подставится автоматически, если оставить поле пустым.
                </>
              }
            />
          </div>

          {groqMeta && (
            <>
              <Subhead weight="2" style={{ padding: '4px 16px 0' }}>
                {groqMeta.label} · бесплатный
              </Subhead>
              <ProviderBlock control={control} meta={groqMeta} />
              <Separator style={{ margin: '8px 0' }} />
            </>
          )}

          {otherProviders.map((meta, index) => (
            <React.Fragment key={meta.id}>
              <Subhead weight="2" style={{ padding: '4px 16px 0' }}>
                {meta.label}
              </Subhead>
              <ProviderBlock
                control={control}
                meta={meta}
                models={initialSettings.providerModels?.[meta.id]}
                hasApiKey={initialSettings.providers?.[meta.id]?.hasApiKey}
              />
              {index < otherProviders.length - 1 && <Separator style={{ margin: '8px 0' }} />}
            </React.Fragment>
          ))}
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
                <Textarea
                  {...field}
                  maxLength={MAX_SYSTEM_PROMPT_LENGTH}
                  placeholder="Ты саркастичный участник чата."
                  value={field.value || ''}
                />
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
