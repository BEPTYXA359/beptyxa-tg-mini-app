import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backButton } from '@telegram-apps/sdk-react';

export const useTelegramBackButton = (onCustomBack?: () => void) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!backButton.isSupported()) return;

    if (location.pathname !== '/') {
      backButton.show();
    } else {
      backButton.hide();
    }

    const handleBackClick = () => {
      if (onCustomBack) {
        onCustomBack();
      } else {
        void navigate(-1);
      }
    };

    backButton.onClick(handleBackClick);

    return () => {
      backButton.offClick(handleBackClick);
    };
  }, [location.pathname, navigate, onCustomBack]);
};
