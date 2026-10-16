import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { SimpleCell, Switch } from '@vkontakte/vkui';
import type { ChatSettings } from '../model/settings.schema';
import { haptic } from '@/shared/utils/haptic.util';

type BooleanSettingsKey = {
  [K in keyof ChatSettings]-?: ChatSettings[K] extends boolean | undefined ? K : never;
}[keyof ChatSettings];

export const ToggleCell: React.FC<{
  control: Control<ChatSettings>;
  name: BooleanSettingsKey;
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
