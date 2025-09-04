const Database = require('better-sqlite3');
const path = require('path');

// Создаем подключение к базе данных
const dbPath = path.join(__dirname, 'diary.db');
const db = new Database(dbPath);

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// SQL для создания таблиц
const createTablesSQL = `
  -- Таблица пользователей
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  -- Таблица для дней
  CREATE TABLE IF NOT EXISTS days (
    date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    display_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (date, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Таблица для записей
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    time TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (date, user_id) REFERENCES days(date, user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_days_user ON days(user_id);
  CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_entries_time ON entries(date, time);
`;

// Функция инициализации базы данных
function initializeDatabase() {
  try {
    console.log('🗄️  Инициализация базы данных SQLite...');

    // Создаем таблицы
    db.exec(createTablesSQL);

    console.log('✅ База данных успешно инициализирована');
    console.log(`📍 Путь к базе данных: ${dbPath}`);

    return db;
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

// Функция для создания тестовых данных (теперь многопользовательская система не требует seed данных)
function seedDatabase() {
  try {
    // В многопользовательской системе не создаем тестовые данные
    // Каждый пользователь создает свои данные после регистрации
    console.log('📝 Многопользовательская система готова к работе');
    console.log('🔐 Пользователи могут регистрироваться через /api/auth/register');
  } catch (error) {
    console.error('❌ Ошибка при инициализации системы:', error);
  }
}

// Функция для закрытия соединения с базой данных
function closeDatabase() {
  if (db) {
    db.close();
    console.log('🔒 Соединение с базой данных закрыто');
  }
}

// Обработчик для корректного закрытия при завершении процесса
process.on('SIGINT', () => {
  console.log('\n📝 Получен сигнал завершения...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📝 Получен сигнал завершения...');
  closeDatabase();
  process.exit(0);
});

module.exports = {
  initializeDatabase,
  seedDatabase,
  closeDatabase,
  db
};
