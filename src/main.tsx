import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '@/App';
import { initTelegram } from '@/app/initTelegram.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const bootstrap = async () => {
  try {
    await initTelegram();
  } catch (error) {
    console.warn('Приложение запущено вне среды Telegram.', error);
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Критическая ошибка: root элемент не найден');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
};

void bootstrap();
