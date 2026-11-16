import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoot, ConfigProvider } from '@vkontakte/vkui';

import '@vkontakte/vkui/dist/vkui.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/600.css';
import './styles/app.css';

import { AppRoutes } from '@/app/AppRoutes';
import { useTgAppearance } from '@/shared/hooks/useTgAppearance';
import { FeedbackProvider } from '@/shared/ui/Feedback/FeedbackProvider';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary/ErrorBoundary';

export const App: React.FC = () => {
  const colorScheme = useTgAppearance();

  return (
    <ConfigProvider colorScheme={colorScheme}>
      <AppRoot>
        <FeedbackProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </FeedbackProvider>
      </AppRoot>
    </ConfigProvider>
  );
};
