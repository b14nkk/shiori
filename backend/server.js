const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, seedDatabase } = require('./database/init');
const DiaryModel = require('./models/diary');
const UserModel = require('./models/user');
const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Инициализация базы данных
console.log('🚀 Запуск Shiori Diary API...');
initializeDatabase();
seedDatabase();

// API Routes

// Подключаем роуты аутентификации
app.use('/api/auth', authRoutes);

// Получить список всех дней (защищенный маршрут)
app.get('/api/days', authenticateToken, async (req, res) => {
  try {
    const days = DiaryModel.getAllDays(req.user.id);
    res.json(days);
  } catch (error) {
    console.error('Ошибка при получении списка дней:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении списка дней' });
  }
});

// Получить все записи за конкретный день (защищенный маршрут)
app.get('/api/days/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;

    // Валидация формата даты
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }

    const dayData = DiaryModel.getDay(date, req.user.id);
    res.json(dayData);
  } catch (error) {
    console.error('Ошибка при получении дня:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении дня' });
  }
});

// Получить сегодняшний день (защищенный маршрут)
app.get('/api/today', authenticateToken, async (req, res) => {
  try {
    const todayData = DiaryModel.getToday(req.user.id);
    res.json(todayData);
  } catch (error) {
    console.error('Ошибка при получении сегодняшнего дня:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении сегодняшнего дня' });
  }
});

// Добавить новую запись ТОЛЬКО в сегодняшний день (защищенный маршрут)
app.post('/api/today/entries', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    // Валидация данных
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Текст записи не может быть пустым' });
    }

    if (text.trim().length > 10000) {
      return res.status(400).json({ error: 'Текст записи слишком длинный (максимум 10000 символов)' });
    }

    const newEntry = DiaryModel.createTodayEntry(text.trim(), req.user.id);

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании записи' });
  }
});

// Получить статистику дневника (защищенный маршрут)
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = DiaryModel.getStatistics(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении статистики' });
  }
});

// Экспорт данных в JSON (защищенный маршрут)
app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const exportData = DiaryModel.exportToJSON(req.user.id);

    // Устанавливаем заголовки для скачивания файла
    const filename = `shiori-diary-export-${req.user.username}-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');

    res.json({
      exportDate: new Date().toISOString(),
      user: {
        id: req.user.id,
        username: req.user.username
      },
      data: exportData
    });
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
    res.status(500).json({ error: 'Ошибка сервера при экспорте данных' });
  }
});

// Базовый маршрут с информацией об API
app.get('/', (req, res) => {
  res.json({
    message: 'Shiori Diary API работает!',
    version: '3.0.0',
    database: 'SQLite',
    authentication: 'JWT',
    publicEndpoints: [
      'GET / - информация об API',
      'POST /api/auth/register - регистрация пользователя',
      'POST /api/auth/login - вход в систему',
      'POST /api/auth/validate - проверка токена',
      'POST /api/auth/check-username - проверка доступности username',
      'POST /api/auth/check-email - проверка доступности email'
    ],
    protectedEndpoints: [
      'GET /api/auth/me - информация о пользователе',
      'POST /api/auth/logout - выход из системы',
      'GET /api/days - список всех дней пользователя',
      'GET /api/days/:date - записи за день',
      'GET /api/today - сегодняшний день',
      'POST /api/today/entries - добавить запись в сегодня',
      'GET /api/statistics - статистика дневника',
      'GET /api/export - экспорт данных в JSON'
    ],
    features: [
      '👤 Многопользовательская система',
      '🔐 JWT аутентификация',
      '📝 Создание записей только в сегодняшний день',
      '📖 Чтение записей любого дня',
      '🗄️ Постоянное хранение в SQLite',
      '📊 Статистика ведения дневника',
      '💾 Экспорт данных в JSON'
    ]
  });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: 'Проверьте правильность URL или обратитесь к документации API'
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error('Глобальная ошибка:', error);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: 'Что-то пошло не так. Попробуйте позже.'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('');
  console.log('🎉 Shiori Diary API успешно запущен!');
  console.log(`📍 Сервер: http://localhost:${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api`);
  console.log(`🔐 Аутентификация: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Статистика: http://localhost:${PORT}/api/statistics`);
  console.log(`💾 Экспорт: http://localhost:${PORT}/api/export`);
  console.log('');
  console.log('👤 Многопользовательский режим: включен');
  console.log('🔐 JWT аутентификация: включена');
  console.log('📖 Режим работы: только чтение старых записей + создание новых в сегодня');
  console.log('🗄️ База данных: SQLite (постоянное хранение)');
  console.log('');
});
