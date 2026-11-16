import { lazy, Suspense, type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@vkontakte/vkui';
import { Layout } from '@/shared/ui/Layout/Layout';

const ChatterboxSettingsPage = lazy(() =>
  import('@/pages/ChatterboxSettingsPage/ChatterboxSettingsPage').then((module) => ({
    default: module.ChatterboxSettingsPage,
  })),
);
const ConversionSettingsPage = lazy(() =>
  import('@/pages/ConversionSettingsPage/ConversionSettingsPage').then((module) => ({
    default: module.ConversionSettingsPage,
  })),
);
const ConverterPage = lazy(() =>
  import('@/pages/ConverterPage/ConverterPage').then((module) => ({
    default: module.ConverterPage,
  })),
);
const HomePage = lazy(() =>
  import('@/pages/HomePage/HomePage').then((module) => ({ default: module.HomePage })),
);
const LlmSettingsPage = lazy(() =>
  import('@/pages/LlmSettingsPage/LlmSettingsPage').then((module) => ({
    default: module.LlmSettingsPage,
  })),
);
const LlmUsagePage = lazy(() =>
  import('@/pages/LlmUsagePage/LlmUsagePage').then((module) => ({
    default: module.LlmUsagePage,
  })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const PlateFormPage = lazy(() =>
  import('@/pages/PlateFormPage/PlateFormPage').then((module) => ({
    default: module.PlateFormPage,
  })),
);
const PlatesPage = lazy(() =>
  import('@/pages/PlatesPage/PlatesPage').then((module) => ({ default: module.PlatesPage })),
);
const ReminderFormPage = lazy(() =>
  import('@/pages/ReminderFormPage/ReminderFormPage').then((module) => ({
    default: module.ReminderFormPage,
  })),
);
const RemindersPage = lazy(() =>
  import('@/pages/RemindersPage/RemindersPage').then((module) => ({
    default: module.RemindersPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);
const SteamSettingsPage = lazy(() =>
  import('@/pages/SteamSettingsPage/SteamSettingsPage').then((module) => ({
    default: module.SteamSettingsPage,
  })),
);
const SubscriptionFormPage = lazy(() =>
  import('@/pages/SubscriptionFormPage/SubscriptionFormPage').then((module) => ({
    default: module.SubscriptionFormPage,
  })),
);
const SubscriptionsPage = lazy(() =>
  import('@/pages/SubscriptionsPage/SubscriptionsPage').then((module) => ({
    default: module.SubscriptionsPage,
  })),
);

export const AppRoutes: FC = () => (
  <Suspense
    fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Spinner size="l" />
      </div>
    }
  >
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/reminders/new" element={<ReminderFormPage />} />
        <Route path="/reminders/:id/edit" element={<ReminderFormPage />} />
        <Route path="/reminders/form" element={<Navigate to="/reminders/new" replace />} />
        <Route path="/plates" element={<PlatesPage />} />
        <Route path="/plates/new" element={<PlateFormPage />} />
        <Route path="/plates/:id/edit" element={<PlateFormPage />} />
        <Route path="/plates/form" element={<Navigate to="/plates/new" replace />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/subscriptions/new" element={<SubscriptionFormPage />} />
        <Route path="/subscriptions/:id/edit" element={<SubscriptionFormPage />} />
        <Route path="/subscriptions/form" element={<Navigate to="/subscriptions/new" replace />} />
        <Route path="/converter" element={<ConverterPage />} />
        <Route path="/conversion-settings" element={<ConversionSettingsPage />} />
        <Route path="/llm-settings" element={<LlmSettingsPage />} />
        <Route path="/chatterbox-settings" element={<ChatterboxSettingsPage />} />
        <Route path="/steam-settings" element={<SteamSettingsPage />} />
        <Route path="/llm-usage" element={<LlmUsagePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>
);
