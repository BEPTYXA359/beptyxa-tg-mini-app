import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  Button,
  Caption,
  FormItem,
  Group,
  Header,
  Placeholder,
  Separator,
  Spinner,
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
  MAX_SYSTEM_PROMPT_LENGTH,
  type ChatSettings,
} from '@/features/settings/model/settings.schema';
import { LLM_PROVIDERS_META } from '@/features/settings/model/providers.meta';
import {
  buildLlmProvidersPatch,
  isProviderConnected,
  sortedProvidersMeta,
} from '@/features/settings/model/provider-settings';
import { ProviderFields } from '@/features/settings/ui/ProviderFields';
import { ToggleCell } from '@/features/settings/ui/ToggleCell';
import { getChatId, getIsGroupChat } from '@/shared/utils/telegram.util';
import { useTelegramBackButton } from '@/shared/hooks/useTelegramBackButton';
import { useFeedback } from '@/shared/ui/Feedback/feedback';
import {
  BottomActionBar,
  BOTTOM_BAR_CLEARANCE,
  TABBAR_OFFSET,
} from '@/shared/ui/BottomActionBar/BottomActionBar';

const LlmSettingsForm: React.FC<{ initialSettings: ChatSettings; chatId?: number }> = ({
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
              endpointVariant: stored?.endpointVariant ?? '',
              endpointVariants: stored?.endpointVariants ?? [],
              supportsWebSearch: stored?.supportsWebSearch ?? false,
              webSearch: stored?.webSearch ?? false,
            },
          ];
        }),
      ),
    },
  });

  const onSubmit = (data: ChatSettings) => {
    const payload: UpdateSettingsPayload = {
      llmSystemPrompt: data.llmSystemPrompt ?? '',
      isStreamingEnabled: data.isStreamingEnabled,
      llmProviders: buildLlmProvidersPatch(data),
    };

    updateSettings(payload, {
      onSuccess: () => {
        feedback.success('Настройки сохранены');
        reset({
          ...data,
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

  const providers = useMemo(() => sortedProvidersMeta(initialSettings), [initialSettings]);

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div style={{ paddingBottom: isDirty ? BOTTOM_BAR_CLEARANCE : TABBAR_OFFSET }}>
        <Group mode="card" header={<Header>Общие</Header>}>
          <Controller
            name="llmSystemPrompt"
            control={control}
            render={({ field }) => (
              <FormItem top="Системный промпт">
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  maxLength={MAX_SYSTEM_PROMPT_LENGTH}
                  placeholder="Ты полезный ассистент."
                />
              </FormItem>
            )}
          />
          {!getIsGroupChat() && (
            <ToggleCell
              control={control}
              name="isStreamingEnabled"
              label="Потоковый ответ (streaming)"
              disabled={isPending}
            />
          )}
        </Group>

        <Group
          mode="card"
          header={<Header>Провайдеры</Header>}
          description="Подключённые — сверху. Начните сообщение со слова-триггера («грок …», «чатгпт …»), слово можно заменить своим в настройках провайдера"
        >
          {providers.map((meta, index) => {
            const connected = isProviderConnected(initialSettings, meta.id);

            return (
              <React.Fragment key={meta.id}>
                <Accordion>
                  <Accordion.Summary
                    subtitle={meta.id === 'Groq' ? 'бесплатный, без ключа' : undefined}
                    after={
                      <Caption
                        level="2"
                        style={{
                          color: connected
                            ? 'var(--vkui--color_text_positive)'
                            : 'var(--vkui--color_text_secondary)',
                        }}
                      >
                        {connected ? 'Подключён' : 'Не подключён'}
                      </Caption>
                    }
                  >
                    {meta.label}
                  </Accordion.Summary>
                  <Accordion.Content>
                    <div style={{ padding: '0 16px 12px' }}>
                      <ProviderFields
                        control={control}
                        meta={meta}
                        models={initialSettings.providerModels?.[meta.id]}
                        entry={initialSettings.providers?.[meta.id]}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion>
                {index < providers.length - 1 && <Separator style={{ margin: '8px 0' }} />}
              </React.Fragment>
            );
          })}
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

export const LlmSettingsPage: React.FC = () => {
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

  return <LlmSettingsForm initialSettings={settings} chatId={chatId} />;
};
