# 📖 Shiori - Личный дневник с аутентификацией

**Shiori** (栞 - "закладка" на японском) - это современное веб-приложение для ведения личного дневника с полноценной системой аутентификации и многопользовательской поддержкой.

![Версия](https://img.shields.io/badge/версия-3.0.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)
![SQLite](https://img.shields.io/badge/database-SQLite-orange)
![JWT](https://img.shields.io/badge/auth-JWT-red)

## ✨ Новые возможности v3.0.0

### 🔐 Система аутентификации
- **JWT токены** для безопасной аутентификации
- **Регистрация и вход** в систему
- **Валидация данных** в реальном времени
- **Защищенные маршруты** для доступа к дневнику
- **Автоматическое обновление токенов**

### 👥 Многопользовательская система
- **Личные дневники** для каждого пользователя
- **Изолированные данные** между пользователями
- **Безопасное хранение** паролей с bcrypt
- **Проверка уникальности** email и username

### 🗄️ База данных
- **SQLite** для постоянного хранения
- **Миграции** и автоматическая инициализация
- **Связанные таблицы** пользователей, дней и записей
- **Индексы** для быстрого поиска

## 🚀 Быстрый старт

### Вариант 1: Простой запуск (рекомендуется)
```bash
# Клонируем репозиторий
git clone <repository-url> shiori
cd shiori

# Используем скрипт быстрого деплоя
chmod +x deploy.sh
./deploy.sh

# Выберите опцию 1 для разработки или 2 для продакшн
```

### Вариант 2: Ручная установка
```bash
# Установка зависимостей
npm run install:all

# Запуск в режиме разработки
npm run dev
```

### Вариант 3: Docker (продакшн)
```bash
# Создание и запуск контейнеров
docker-compose up -d

# Проверка состояния
docker-compose ps
```

## 📱 Использование

### Регистрация нового пользователя
1. Перейдите на http://localhost:3000
2. Нажмите "Регистрация"
3. Заполните форму:
   - **Username**: 3-20 символов, только буквы, цифры и _
   - **Email**: действующий email адрес
   - **Password**: минимум 6 символов с буквами и цифрами
4. Нажмите "Зарегистрироваться"

### Вход в систему
1. Введите email и пароль
2. Нажмите "Войти"
3. Вы будете перенаправлены в свой личный дневник

### Ведение дневника
- **Создание записей**: только в текущий день
- **Просмотр записей**: любого дня в прошлом
- **Экспорт данных**: скачивание дневника в JSON
- **Статистика**: количество дней и записей

## 🛠️ Архитектура

### Backend (Node.js + Express)
```
backend/
├── server.js              # Главный сервер
├── database/
│   ├── init.js            # Инициализация БД
│   └── diary.db           # SQLite база данных
├── models/
│   ├── diary.js           # Модель дневника
│   └── user.js            # Модель пользователей
├── middleware/
│   └── auth.js            # JWT middleware
├── routes/
│   └── auth.js            # Роуты аутентификации
└── package.json
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── app/               # Главное приложение
│   ├── features/
│   │   └── auth/          # Компоненты аутентификации
│   ├── shared/
│   │   ├── api/           # API клиенты
│   │   └── components/    # Переиспользуемые компоненты
│   └── pages/             # Страницы приложения
└── package.json
```

## 🔧 API Endpoints

### Публичные (без аутентификации)
```http
GET  /                           # Информация об API
POST /api/auth/register          # Регистрация
POST /api/auth/login             # Вход в систему  
POST /api/auth/validate          # Валидация токена
POST /api/auth/check-username    # Проверка username
POST /api/auth/check-email       # Проверка email
```

### Защищенные (требуют JWT токен)
```http
GET  /api/auth/me               # Данные пользователя
POST /api/auth/logout           # Выход из системы
GET  /api/days                  # Список дней пользователя
GET  /api/days/:date            # Записи за день
GET  /api/today                 # Сегодняшний день
POST /api/today/entries         # Создать запись
GET  /api/statistics            # Статистика дневника
GET  /api/export                # Экспорт данных
```

### Пример запроса с аутентификацией
```javascript
// Регистрация
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myuser',
    email: 'user@example.com',
    password: 'password123'
  })
});

// Использование токена
const token = response.token;
const diaryResponse = await fetch('/api/today', {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
});
```

## 🐳 Docker деплой

### Создание .env файла
```env
# JWT настройки
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Backend настройки  
NODE_ENV=production
PORT=3001
```

### Запуск продакшн версии
```bash
# Сборка и запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 📊 Мониторинг и обслуживание

### Проверка здоровья системы
```bash
# Статус сервисов
./deploy.sh
# Выберите опцию 6

# Health check
curl http://localhost:3001/
curl http://localhost/
```

### Бэкапы базы данных
```bash
# Создание бэкапа
cp ./data/diary.db ./backups/diary-$(date +%Y%m%d).db

# Автоматический бэкап (добавить в cron)
0 2 * * * cp /path/to/shiori/data/diary.db /path/to/backups/diary-$(date +\%Y\%m\%d).db
```

### Логирование
```bash
# Логи backend
docker-compose logs backend

# Логи frontend  
docker-compose logs frontend

# Все логи
docker-compose logs -f
```

## 🔒 Безопасность

### Встроенные меры безопасности
- **bcrypt** хеширование паролей
- **JWT токены** с истечением срока действия
- **CORS** политики для API
- **Валидация** всех входящих данных
- **SQL injection** защита с prepared statements
- **XSS** защита в React

### Рекомендации для продакшн
1. **Смените JWT_SECRET** на сложный ключ
2. **Используйте HTTPS** с SSL сертификатами
3. **Настройте firewall** для ограничения доступа
4. **Регулярные бэкапы** базы данных
5. **Мониторинг** и логирование запросов
6. **Rate limiting** для защиты от брутфорса

## 🧪 Тестирование

### Автоматические тесты API
```bash
# Запуск тестов (требует запущенный сервер)
node test-api.js

# Health check
node health-check.js
```

### Ручное тестирование
```bash
# Регистрация пользователя
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Вход в систему  
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Создание записи (с токеном)
curl -X POST http://localhost:3001/api/today/entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Моя первая запись!"}'
```

## 🚀 Производительность

### Оптимизации
- **SQLite индексы** для быстрых запросов
- **React мемоизация** компонентов
- **Сжатие gzip** для статических ресурсов
- **Кеширование** статики в nginx
- **Минификация** CSS и JS

### Метрики
- **Backend**: < 50ms время ответа
- **Frontend**: < 2s загрузка приложения
- **Database**: < 10ms запросы с индексами
- **Bundle size**: оптимизированный размер сборки

## 📈 Масштабирование

### Горизонтальное масштабирование
- **Load balancer** для нескольких инстансов
- **PostgreSQL** вместо SQLite для больших нагрузок
- **Redis** для сессий и кеширования
- **CDN** для статических ресурсов

### Вертикальное масштабирование
- **PM2** для управления процессами
- **Nginx** как reverse proxy
- **SSL termination** на уровне proxy
- **Мониторинг** ресурсов сервера

## 🔄 Roadmap v4.0.0

### Планируемые возможности
- [ ] **Поиск по записям** с полнотекстовым поиском
- [ ] **Теги и категории** для организации записей
- [ ] **Markdown поддержка** для форматирования
- [ ] **Прикрепление файлов** к записям
- [ ] **Темная тема** интерфейса
- [ ] **PWA** поддержка для мобильных
- [ ] **Экспорт в PDF** и другие форматы
- [ ] **API для интеграций** с внешними сервисами
- [ ] **Двухфакторная аутентификация** (2FA)
- [ ] **Социальная авторизация** (Google, GitHub)

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👨‍💻 Автор

Создано с ❤️ для ведения личных дневников с максимальной безопасностью и удобством.

---

**Shiori v3.0.0** - Ваш безопасный личный дневник 📖✨