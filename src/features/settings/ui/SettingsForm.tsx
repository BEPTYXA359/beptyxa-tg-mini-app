import React from 'react';
import {
  Section,
  Switch,
  List,
  Cell,
  Blockquote,
  Input,
  Button,
  Slider,
  Select,
  Textarea,
  Subheadline,
  FixedLayout,
} from '@telegram-apps/telegram-ui';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import { type ChatSettings, ChatSettingsSchema } from '../model/settings.schema';
import { Save } from 'lucide-react';

export const SettingsForm: React.FC<{ initialSettings: ChatSettings }> = ({ initialSettings }) => {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

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
    const payload: Partial<ChatSettings> = {
      ...data,
    };

    if (!payload.openAiApiKey?.trim()) {
      delete payload.openAiApiKey;
    }

    updateSettings(payload, {
      onSuccess: () => {
        reset({ ...data, openAiApiKey: '' });
      },
    });
  };

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    void handleSubmit(
      (data) => {
        onSubmit(data);
      },
      (err) => {
        console.error('Ошибка сохранения настроек:', err);
      },
    )(e);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <List style={{ background: 'var(--tgui--secondary_bg_color)', paddingBottom: 66 }}>
        <Section header="Грок и OpenAI">
          <Blockquote type="text" style={{ margin: '0 16px 16px' }}>
            Общайтесь с ИИ! Вы можете обратиться к бесплатной модели, начав сообщение со слова{' '}
            <b>«грок ...»</b>.
            <br />
            <br />
            Для использования более мощной модели укажите ваш API-ключ OpenAI, включите тумблер ниже
            и начинайте запрос со слова <b>«чатгпт ...»</b>.
          </Blockquote>

          <Controller
            name="llmSystemPrompt"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                header="Системный промпт (LLM)"
                placeholder="Ты полезный ассистент."
                value={field.value || ''}
              />
            )}
          />

          <Controller
            name="isOpenAiEnabled"
            control={control}
            render={({ field }) => (
              <Cell
                Component="label"
                after={
                  <Switch checked={field.value} onChange={field.onChange} disabled={isPending} />
                }
              >
                Использовать OpenAI
              </Cell>
            )}
          />

          <Controller
            name="openAiApiKey"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                header="API Ключ OpenAI"
                placeholder={initialSettings?.hasOpenAiApiKey ? '●●●●●●●●●●●●●●●●' : 'sk-...'}
                type="password"
              />
            )}
          />

          <Controller
            name="openAiModel"
            control={control}
            render={({ field }) => (
              <Select header="Модель OpenAI" {...field} disabled>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </Select>
            )}
          />
        </Section>

        <Section header="Балабол">
          <Blockquote type="text" style={{ margin: '0 16px 16px' }}>
            «Балабол» — это режим, при котором ассистент спонтанно участвует в беседах чата от
            своего имени. Вы можете настроить вероятность его срабатывания (в процентах) и задать
            уникальный характер общения.
          </Blockquote>

          <Controller
            name="isChatterboxEnabled"
            control={control}
            render={({ field }) => (
              <Cell
                Component="label"
                after={
                  <Switch checked={field.value} onChange={field.onChange} disabled={isPending} />
                }
              >
                Включить Балабола
              </Cell>
            )}
          />

          <Controller
            name="chatterboxSystemPrompt"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                header="Характер (Системный промпт)"
                placeholder="Ты саркастичный участник чата."
                value={field.value || ''}
              />
            )}
          />

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}
          >
            <Subheadline level="1" weight="3" style={{ padding: '0 24px' }}>
              Шанс срабатывания
            </Subheadline>
            <Controller
              name="chatterboxChance"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round((field.value || 0) * 100)}
                  after={
                    <Subheadline level="2" weight="1">
                      {Math.round((field.value || 0) * 100)}%
                    </Subheadline>
                  }
                  onChange={(e) => {
                    const sliderValue =
                      typeof e === 'number'
                        ? e
                        : Number((e as React.ChangeEvent<HTMLInputElement>).target.value);
                    field.onChange(sliderValue / 100);
                  }}
                />
              )}
            />
          </div>
        </Section>
      </List>

      {isDirty && (
        <FixedLayout
          style={{
            padding: '8px 8px 90px 8px',
          }}
        >
          <Button
            size="l"
            stretched
            loading={isPending}
            type="submit"
            before={<Save size={16} color="var(--tgui--button_text_color)" />}
          >
            Сохранить изменения
          </Button>
        </FixedLayout>
      )}
    </form>
  );
};
