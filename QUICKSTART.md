# 🚀 Quick Start Guide

Быстрый старт для Shiori Notes App - простого приложения для заметок.

## 📋 Требования

- Node.js (версия 16 или выше)
- npm (обычно идет в комплекте с Node.js)

## ⚡ Быстрый запуск (рекомендуется)

### Вариант 1: Автоматический запуск

```bash
# 1. Перейти в папку проекта
cd shiori

# 2. Запустить скрипт автоматической настройки
./start-dev.sh
```

Этот скрипт автоматически:
- Установит все зависимости
- Запустит backend на порту 3001
- Запустит frontend на порту 3000
- Покажет все доступные URL

### Вариант 2: Через npm команды

```bash
# 1. Установить все зависимости
npm run install:all

# 2. Запустить оба сервера одновременно
npm run dev
```

## 🔧 Ручная настройка

Если предпочитаете больше контроля:

### Backend

```bash
cd backend
npm install
npm run dev    # Запуск с nodemon (автоперезагрузка)
# или
npm start      # Обычный запуск
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # Запуск dev сервера
```

## 🌐 Доступные URL

После запуска приложение будет доступно по следующим адресам:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API документация**: http://localhost:3001/api/notes

## 🧪 Тестирование API

```bash
# Тестирование API endpoints
npm run test:api
```

## 📱 Использование

1. Откройте http://localhost:3000 в браузере
2. Заполните форму для создания заметки
3. Нажмите "Создать заметку"
4. Управляйте заметками через интерфейс

## 🎯 Основные функции

- ✅ Создание заметок
- ✅ Просмотр списка заметок  
- ✅ Редактирование заметок
- ✅ Удаление заметок
- ✅ Адаптивный дизайн

## 🔍 API Endpoints

- `GET /api/notes` - получить все заметки
- `GET /api/notes/:id` - получить заметку по ID
- `POST /api/notes` - создать заметку
- `PUT /api/notes/:id` - обновить заметку
- `DELETE /api/notes/:id` - удалить заметку

## 🛠 Полезные команды

```bash
# Установка зависимостей
npm run install:all

# Запуск в режиме разработки
npm run dev

# Только backend
npm run dev:backend

# Только frontend  
npm run dev:frontend

# Сборка для продакшена
npm run build

# Тестирование API
npm run test:api

# Очистка зависимостей
npm run clean
```

## 🚨 Решение проблем

### Порт уже занят

Если порт 3000 или 3001 занят:

```bash
# Найти процесс на порту
lsof -i :3000
lsof -i :3001

# Завершить процесс
kill -9 <PID>
```

### Ошибки зависимостей

```bash
# Очистить и переустановить
npm run clean
npm run install:all
```

### Backend не запускается

```bash
cd backend
node server.js
# Смотрим ошибки в консоли
```

### Frontend не запускается

```bash
cd frontend
npm run dev
# Смотрим ошибки в консоли
```

## 📦 Структура проекта

```
shiori/
├── backend/          # Node.js + Express API
│   ├── server.js     # Основной файл сервера
│   └── package.json  # Зависимости backend
├── frontend/         # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx   # Главный компонент
│   │   ├── api.ts    # API клиент
│   │   └── types.ts  # TypeScript типы
│   └── package.json  # Зависимости frontend
├── package.json      # Управление всем проектом
├── start-dev.sh      # Скрипт автозапуска
└── test-api.js       # Тесты API
```

## 🎉 Готово!

Теперь у вас запущено полнофункциональное приложение для заметок!

Переходите к http://localhost:3000 и начинайте создавать заметки! 📝