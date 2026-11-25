import { Avatar, Banner } from '@vkontakte/vkui';
import { Flag } from 'lucide-react';
import { haptic } from '@/shared/utils/haptic.util';

export const F1Widget = ({ onClick }: { onClick: () => void }) => (
  <Banner
    mode="tint"
    before={
      <Avatar size={40} style={{ background: 'var(--vkui--color_background_accent)' }}>
        <Flag size={20} color="var(--vkui--color_background_contrast)" />
      </Avatar>
    }
    title="Формула-1"
    subtitle="Календарь, результаты и кубок"
    after="chevron"
    onClick={() => {
      haptic.impact('light');
      onClick();
    }}
  />
);
