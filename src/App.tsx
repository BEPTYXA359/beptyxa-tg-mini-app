import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AppRoot, ConfigProvider } from '@vkontakte/vkui';

import '@vkontakte/vkui/dist/vkui.css';
import '@fontsource/roboto-mono/600.css';
import './styles/fonts.css';
import './styles/app.css';

import { useTgAppearance } from '@/shared/hooks/useTgAppearance';
import { FeedbackProvider } from '@/shared/ui/Feedback/FeedbackProvider';
import { Layout } from '@/shared/ui/Layout/Layout';
import { HomePage } from '@/pages/HomePage/HomePage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';
import { RemindersPage } from '@/pages/RemindersPage/RemindersPage';
import { ReminderFormPage } from '@/pages/ReminderFormPage/ReminderFormPage';
import { PlatesPage } from '@/pages/PlatesPage/PlatesPage';
import { PlateFormPage } from '@/pages/PlateFormPage/PlateFormPage';

export const App: React.FC = () => {
  const colorScheme = useTgAppearance();

  return (
    <ConfigProvider colorScheme={colorScheme}>
      <AppRoot>
        <FeedbackProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/reminders/form" element={<ReminderFormPage />} />
                <Route path="/plates" element={<PlatesPage />} />
                <Route path="/plates/form" element={<PlateFormPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FeedbackProvider>
      </AppRoot>
    </ConfigProvider>
  );
};
