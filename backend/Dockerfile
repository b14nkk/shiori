# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для компиляции native модулей
RUN apk add --no-cache python3 make g++ sqlite

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для базы данных
RUN mkdir -p /app/database

# Устанавливаем права доступа
RUN chmod 755 /app/database

# Открываем порт
EXPOSE 3001

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3001
ENV JWT_SECRET=shiori-production-secret-key-change-this-in-production

# Команда запуска
CMD ["npm", "start"]
