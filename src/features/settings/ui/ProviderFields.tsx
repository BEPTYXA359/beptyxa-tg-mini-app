import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { CustomSelect, FormItem, Input, SimpleCell, Switch } from '@vkontakte/vkui';
import type { ChatSettings, LlmProviderEntry } from '../model/settings.schema';
import type { LlmProviderMeta } from '../model/providers.meta';
import { MAX_ALIAS_LENGTH } from '../model/settings.schema';
import { haptic } from '@/shared/utils/haptic.util';

type ProviderField = 'apiKey' | 'model' | 'alias' | 'endpointVariant';

const providerPath = (meta: LlmProviderMeta, field: ProviderField) =>
  `providers.${meta.id}.${field}` as const;

// Отдельно от строковых полей — иначе union с boolean ломает типы value у инпутов
const providerFlagPath = (meta: LlmProviderMeta) => `providers.${meta.id}.webSearch` as const;

/** Поля настроек одного провайдера: ключ, модель, эндпоинт, веб-поиск, своё слово-триггер */
export const ProviderFields: React.FC<{
  control: Control<ChatSettings>;
  meta: LlmProviderMeta;
  models?: string[];
  entry?: LlmProviderEntry;
}> = ({ control, meta, models, entry }) => {
  const hasApiKey = entry?.hasApiKey ?? false;
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
            const options =
              value && !modelOptions.some((option) => option.value === value)
                ? [{ label: value, value }, ...modelOptions]
                : modelOptions;

            return modelOptions.length > 0 ? (
              <FormItem top="Модель" bottom="Пусто — модель провайдера по умолчанию">
                <CustomSelect
                  value={value}
                  name={field.name}
                  onChange={field.onChange}
                  placeholder="Выберите модель"
                  options={options}
                  allowClearButton
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

      {(entry?.endpointVariants?.length ?? 0) > 0 && (
        <Controller
          name={providerPath(meta, 'endpointVariant')}
          control={control}
          render={({ field }) => {
            const variants = entry?.endpointVariants ?? [];
            const value = field.value || variants[0]?.id || '';
            // Сохранённый вариант мог исчезнуть из реестра — не теряем его
            const options = (
              variants.some((variant) => variant.id === value)
                ? variants
                : [{ id: value, label: value }, ...variants]
            ).map((variant) => ({ label: variant.label, value: variant.id }));

            return (
              <FormItem top="Эндпоинт" bottom="Где списываются токены">
                <CustomSelect
                  value={value}
                  name={field.name}
                  onChange={field.onChange}
                  options={options}
                />
              </FormItem>
            );
          }}
        />
      )}

      {entry?.supportsWebSearch && (
        <>
          <Controller
            name={providerFlagPath(meta)}
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
                Поиск в интернете
              </SimpleCell>
            )}
          />
          <div
            style={{
              padding: '0 16px 8px',
              color: 'var(--vkui--color_text_secondary)',
              fontSize: 13,
            }}
          >
            Поиск выполняет провайдер и тарифицирует отдельно от токенов
          </div>
        </>
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
