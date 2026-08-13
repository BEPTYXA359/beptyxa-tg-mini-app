import React from 'react';

export const TABBAR_OFFSET = 'calc(48px + env(safe-area-inset-bottom, 0px))';

export const BOTTOM_BAR_CLEARANCE = `calc(${TABBAR_OFFSET} + 72px)`;

interface BottomActionBarProps {
  children: React.ReactNode;
  visible?: boolean;
}

/**
 * Фиксированная панель действий над нижним таббаром.
 * Замена устаревшего FixedLayout. Сама позиционируется над таббаром и
 * учитывает safe-area через токены VKUI.
 */
export const BottomActionBar: React.FC<BottomActionBarProps> = ({ children, visible = true }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: TABBAR_OFFSET,
        padding: `8px var(--vkui--size_base_padding_horizontal--regular)`,
        zIndex: 9,
      }}
    >
      {children}
    </div>
  );
};
