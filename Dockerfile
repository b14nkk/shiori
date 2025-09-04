# Multi-stage build для Railway deployment
FROM node:20-alpine AS base

# Устанавливаем необходимые пакеты для компиляции
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  sqlite \
  && ln -sf python3 /usr/bin/python

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Устанавливаем зависимости
RUN npm ci --only=production

# Backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Frontend dependencies и сборка
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Возвращаемся в корень и копируем backend код
WORKDIR /app
COPY backend/ ./backend/

# Создаем директорию для базы данных
RUN mkdir -p ./backend/database && \
  chmod 755 ./backend/database

# Открываем порт (Railway автоматически назначит PORT)
EXPOSE $PORT

# Переменные окружения
ENV NODE_ENV=production

# Команда запуска
CMD ["sh", "-c", "cd backend && npm start"]
