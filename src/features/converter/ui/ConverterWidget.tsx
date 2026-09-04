import React from 'react';
import { Avatar, Banner } from '@vkontakte/vkui';
import { ArrowLeftRight } from 'lucide-react';
import { haptic } from '@/shared/utils/haptic.util.ts';

interface ConverterWidgetProps {
  onClick: () => void;
}

export const ConverterWidget: React.FC<ConverterWidgetProps> = ({ onClick }) => (
  <Banner
    mode="tint"
    before={
      <Avatar size={40} style={{ background: 'var(--vkui--color_background_accent)' }}>
        <ArrowLeftRight size={20} color="var(--vkui--color_background_contrast)" />
      </Avatar>
    }
    title="Конвертер"
    subtitle="Валюты и единицы измерения"
    after="chevron"
    onClick={() => {
      haptic.impact('light');
      onClick();
    }}
  />
);
