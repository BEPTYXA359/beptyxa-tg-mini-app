# Beptyxa TG Mini App

> Мини-приложение для [@BeptyxaChatBot](https://t.me/BeptyxaChatBot)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)
![VKUI](https://img.shields.io/badge/VKUI-8-0077FF?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vitedotjs)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker)

## Возможности

* **⏰ Напоминания** — разовые, ежедневные, через день и по дням недели с учётом часового пояса; steam-релизы в read-режиме со списком подписчиков; удаление с возможностью отмены
* **💳 Подписки** — цена в оригинальной валюте с примерным пересчётом в валюту чата, сортировка по ближайшему списанию, статистика «в месяц / в год», периоды от недели до года, пауза, пресеты популярных сервисов, цветные карточки; удаление с отменой
* **🚗 Номера машин** — рамки-номера автомобилей, поиск по номеру и владельцу, живое превью при вводе, удаление с отменой
* **⚙️ Настройки** — системные промпты для LLM и Балабола, стриминг ответов, ключ OpenAI и выбор модели, шанс случайных ответов в группах
* **🏠 Главная** — виджеты с ближайшим напоминанием, последним добавленным номером и сводкой по подпискам
* **📱 Telegram-интеграция** — авторизация по initData, BackButton, тема из цветовой схемы клиента, хаптика, pull-to-refresh и скелетоны загрузки

## Стек

* **UI:** React 18, VKUI 8, lucide-react
* **Язык:** TypeScript (strict mode)
* **Telegram:** @telegram-apps/sdk-react — initData, BackButton, themeParams, viewport
* **Data:** TanStack Query 5, axios; формы на react-hook-form + zod
* **Шрифты:** RoadNumbers + Roboto Mono
* **Сборка:** Vite 8, ESLint, Prettier
* **Infrastructure:** Docker (node:22-alpine → nginx:alpine), TLS от Let's Encrypt, nginx проксирует `/api` на бэкенд бота

---

## Быстрый запуск

### 1. Клонирование и установка зависимостей

```bash
git clone https://github.com/BEPTYXA359/beptyxa-tg-mini-app.git
cd beptyxa-tg-mini-app
npm ci
```

### 2. Настройка переменных окружения

Приложение использует одну переменную — базовый URL API:

```env
VITE_API_URL = /api
```

В режиме разработки `/api` проксируется на `http://127.0.0.1:3000`, поэтому рядом должен быть запущен [beptyxa-chat-bot-v2](https://github.com/BEPTYXA359/beptyxa-chat-bot-v2).

### 3. Запуск в режиме разработки

```bash
npm run dev
```

---

## Сборка и проверка типов

```bash
# Продакшен-сборка (tsc + vite build)
npm run build

# Локальный просмотр собранного бандла
npm run preview

# Линтинг
npm run lint
```

## Docker

```bash
docker-compose up -d --build
```

Контейнер поднимает nginx на 443 порту (наружу — `8443`) с TLS-сертификатами Let's Encrypt и проксирует запросы к `/api` на бэкенд через общую сеть `beptyxa-network`. Параметры задаются переменными `SERVER_NAME`, `BACKEND_CONTAINER_NAME` и `BACKEND_PORT`.
