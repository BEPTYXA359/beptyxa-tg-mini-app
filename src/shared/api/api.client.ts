import axios from 'axios';
import { initDataRaw } from '@telegram-apps/sdk-react';
import { env } from '@/shared/config/env.config';

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = initDataRaw();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    console.warn('Отправка запроса без заголовка Authorization');
  }

  return config;
});
