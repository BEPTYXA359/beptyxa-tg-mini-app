import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';

import '@telegram-apps/telegram-ui/dist/styles.css';

import { Layout } from '@/shared/ui/Layout/Layout';
import { HomePage } from '@/pages/HomePage/HomePage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';
import { RemindersPage } from '@/pages/RemindersPage/RemindersPage';
import { ReminderFormPage } from '@/pages/ReminderFormPage/ReminderFormPage';

export const App: React.FC = () => {
  return (
    <AppRoot>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/reminders/form" element={<ReminderFormPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppRoot>
  );
};
