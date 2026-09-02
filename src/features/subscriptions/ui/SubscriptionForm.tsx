import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
} from '@vkontakte/vkui';
import { Save, Trash } from 'lucide-react';
import {
  CURRENCY_OPTIONS,
  type SubscriptionFormInput,
  subscriptionFormSchema,
  parseCost,
  SUBSCRIPTION_PERIOD_OPTIONS,
  SUBSCRIPTION_REMIND_OPTIONS,
  type SubscriptionPayload,
  type Subscription,
} from '../model/subscriptions.types.ts';
import { COLOR_PALETTE, type ServicePreset, SERVICE_PRESETS } from '../model/service-presets.ts';
import { haptic } from '@/shared/utils/haptic.util.ts';

interface SubscriptionFormProps {
  subscriptionToEdit: Subscription | null;
  onFormSubmit: (payload: SubscriptionPayload, id?: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  onDelete?: () => void;
}

const createDefaults = (subscription: Subscription | null): SubscriptionFormInput => {
  if (!subscription) {
    return {
      name: '',
      service: '',
      cost: '',
      currency: 'RUB',
      period: 'month',
      nextPaymentDate: '',
      remindDaysBefore: '1',
      notificationsEnabled: true,
      paused: false,
      color: '',
    };
  }
  return {
    name: subscription.name,
    service: subscription.service ?? '',
    cost: String(subscription.cost),
    currency: subscription.currency,
    period: subscription.period,
    nextPaymentDate: subscription.nextPaymentDate,
    remindDaysBefore:
      subscription.remindDaysBefore === 3 ? '3' : subscription.remindDaysBefore === 7 ? '7' : '1',
    notificationsEnabled: subscription.notificationsEnabled,
    paused: subscription.status === 'paused',
    color: subscription.color ?? '',
  };
};

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscriptionToEdit,
  onFormSubmit,
  onDirtyChange,
  onDelete,
}) => {
  const isEditMode = !!subscriptionToEdit;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SubscriptionFormInput>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: createDefaults(subscriptionToEdit),
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    reset(createDefaults(subscriptionToEdit));
  }, [subscriptionToEdit, reset]);

  const selectedColor = useWatch({ control, name: 'color' });
  const selectedName = useWatch({ control, name: 'name' });

  const activePresetName = selectedName?.trim().toLowerCase();

  const applyPreset = (preset: ServicePreset) => {
    haptic.selection();
    setValue('name', preset.name, { shouldDirty: true });
    setValue('service', preset.service ?? '', { shouldDirty: true });
    setValue('color', preset.color, { shouldDirty: true });
  };

  const onSubmit = async (data: SubscriptionFormInput) => {
    const payload: SubscriptionPayload = {
      name: data.name.trim(),
      service: data.service.trim() ? data.service.trim() : undefined,
      cost: parseCost(data.cost),
      currency: data.currency,
      period: data.period,
      nextPaymentDate: data.nextPaymentDate,
      remindDaysBefore: Number(data.remindDaysBefore),
      notificationsEnabled: data.notificationsEnabled,
      status: data.paused ? 'paused' : 'active',
      color: /^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color.toUpperCase() : undefined,
    };

    await onFormSubmit(payload, subscriptionToEdit?._id);
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <Group mode="card" header={<Header>Быстрый выбор</Header>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 12px' }}>
          {SERVICE_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              mode={activePresetName === preset.name.toLowerCase() ? 'primary' : 'secondary'}
              size="s"
              before={
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: preset.color,
                    display: 'inline-block',
                  }}
                />
              }
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </Group>

      <Group
        mode="card"
        header={<Header>{isEditMode ? 'Редактирование' : 'Новая подписка'}</Header>}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Название"
              status={errors.name ? 'error' : 'default'}
              bottom={errors.name?.message}
            >
              <Input {...field} placeholder="Например, Netflix" value={field.value || ''} />
            </FormItem>
          )}
        />

        <Controller
          name="service"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Сервис"
              status={errors.service ? 'error' : 'default'}
              bottom={errors.service?.message ?? 'Необязательно, например «Яндекс»'}
            >
              <Input {...field} placeholder="Яндекс" value={field.value || ''} />
            </FormItem>
          )}
        />

        <Controller
          name="cost"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Стоимость"
              status={errors.cost ? 'error' : 'default'}
              bottom={errors.cost?.message}
            >
              <Input
                {...field}
                type="text"
                inputMode="decimal"
                placeholder="9.99"
                value={field.value || ''}
              />
            </FormItem>
          )}
        />

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Валюта"
              status={errors.currency ? 'error' : 'default'}
              bottom={errors.currency?.message}
            >
              <CustomSelect
                {...field}
                options={CURRENCY_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormItem>
          )}
        />

        <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Период оплаты"
              status={errors.period ? 'error' : 'default'}
              bottom={errors.period?.message}
            >
              <CustomSelect
                options={SUBSCRIPTION_PERIOD_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormItem>
          )}
        />

        <Controller
          name="nextPaymentDate"
          control={control}
          render={({ field }) => (
            <FormItem
              top="Дата следующего списания"
              status={errors.nextPaymentDate ? 'error' : 'default'}
              bottom={errors.nextPaymentDate?.message}
            >
              <Input
                {...field}
                type="date"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormItem>
          )}
        />

        <Controller
          name="remindDaysBefore"
          control={control}
          render={({ field }) => (
            <FormItem top="Напомнить о списании">
              <CustomSelect
                options={SUBSCRIPTION_REMIND_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormItem>
          )}
        />

        <Controller
          name="notificationsEnabled"
          control={control}
          render={({ field }) => (
            <SimpleCell
              disabled
              multiline
              after={
                <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              }
            >
              Напоминания
            </SimpleCell>
          )}
        />

        <Controller
          name="paused"
          control={control}
          render={({ field }) => (
            <SimpleCell
              disabled
              multiline
              subtitle="Скрывается из списка и статистики, напоминания не приходят"
              after={
                <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              }
            >
              Пауза
            </SimpleCell>
          )}
        />

        <FormItem top="Цвет карточки">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 2 }}>
            <button
              type="button"
              aria-label="Без цвета"
              onClick={() => {
                haptic.selection();
                setValue('color', '', { shouldDirty: true });
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: `2px ${selectedColor === '' ? 'solid var(--vkui--color_stroke_accent)' : 'dashed var(--vkui--color_icon_secondary)'}`,
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Цвет ${color}`}
                onClick={() => {
                  haptic.selection();
                  setValue('color', color, { shouldDirty: true });
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: color,
                  border: `2px solid ${selectedColor === color ? 'var(--vkui--color_stroke_accent)' : 'transparent'}`,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </FormItem>

        {isEditMode && subscriptionToEdit && (
          <div
            style={{
              padding: '0 16px 16px',
              color: 'var(--vkui--color_text_secondary)',
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            Добавил: {subscriptionToEdit.creatorFirstName}
            {subscriptionToEdit.creatorUsername ? ` (@${subscriptionToEdit.creatorUsername})` : ''}
          </div>
        )}
      </Group>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <Button size="l" stretched type="submit" loading={isSubmitting} before={<Save size={16} />}>
          {isEditMode ? 'Сохранить изменения' : 'Добавить'}
        </Button>
        {isEditMode && onDelete && (
          <Button
            size="l"
            stretched
            mode="secondary"
            appearance="negative"
            before={<Trash size={16} />}
            onClick={onDelete}
          >
            Удалить подписку
          </Button>
        )}
      </div>
    </form>
  );
};
