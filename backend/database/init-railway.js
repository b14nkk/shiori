const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем подключение к базе данных
const dbPath = path.join(__dirname, 'diary.db');
const db = new sqlite3.Database(dbPath);

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
  return new Promise((resolve, reject) => {
    console.log('🗄️  Инициализация базы данных SQLite (Railway режим)...');

    db.serialize(() => {
      // Включаем поддержку внешних ключей
      db.run("PRAGMA foreign_keys = ON");

      // Создаем таблицы
      db.exec(createTablesSQL, (err) => {
        if (err) {
          console.error('❌ Ошибка при инициализации базы данных:', err);
          reject(err);
          return;
        }

        console.log('✅ База данных успешно инициализирована');
        console.log(`📍 Путь к базе данных: ${dbPath}`);
        resolve(db);
      });
    });
  });
}

// Функция для создания тестовых данных (теперь многопользовательская система не требует seed данных)
function seedDatabase() {
  return new Promise((resolve) => {
    console.log('📝 Многопользовательская система готова к работе');
    console.log('🔐 Пользователи могут регистрироваться через /api/auth/register');
    resolve();
  });
}

// Функция для закрытия соединения с базой данных
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Ошибка при закрытии базы данных:', err);
        } else {
          console.log('🔒 Соединение с базой данных закрыто');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Обработчик для корректного закрытия при завершении процесса
process.on('SIGINT', () => {
  console.log('\n📝 Получен сигнал завершения...');
  closeDatabase().then(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n📝 Получен сигнал завершения...');
  closeDatabase().then(() => {
    process.exit(0);
  });
});

// Wrapper функции для совместимости с better-sqlite3 API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                lastInsertRowid: this.lastID,
                changes: this.changes
              });
            }
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          db.get(sql, params, (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      }
    };
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  pragma: (pragma) => {
    return new Promise((resolve, reject) => {
      db.run(`PRAGMA ${pragma}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

module.exports = {
  initializeDatabase,
  seedDatabase,
  closeDatabase,
  db: dbWrapper
};
