const { db } = require('../database/init');

// Утилиты для работы с датами
function getCurrentDate() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:MM
}

function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Сегодня';
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

// Prepared statements будут инициализированы позже
let statements = null;

// Функция для инициализации prepared statements
function initStatements() {
  statements = {
    // Получить все дни с количеством записей для пользователя
    getAllDays: db.prepare(`
      SELECT
        d.date,
        d.display_date,
        COUNT(e.id) as entries_count,
        MAX(e.id) as last_entry_id
      FROM days d
      LEFT JOIN entries e ON d.date = e.date AND d.user_id = e.user_id
      WHERE d.user_id = ?
      GROUP BY d.date, d.display_date
      ORDER BY d.date DESC
    `),

    // Получить последнюю запись для дня
    getLastEntry: db.prepare(`
      SELECT id, time, text, created_at
      FROM entries
      WHERE id = ? AND user_id = ?
    `),

    // Получить все записи за день для пользователя
    getDayEntries: db.prepare(`
      SELECT id, time, text, created_at, updated_at
      FROM entries
      WHERE date = ? AND user_id = ?
      ORDER BY time ASC
    `),

    // Создать или обновить день для пользователя
    upsertDay: db.prepare(`
      INSERT OR REPLACE INTO days (date, user_id, display_date)
      VALUES (?, ?, ?)
    `),

    // Добавить новую запись для пользователя
    insertEntry: db.prepare(`
      INSERT INTO entries (date, user_id, time, text)
      VALUES (?, ?, ?, ?)
    `),

    // Проверить существование дня для пользователя
    dayExists: db.prepare(`
      SELECT 1 FROM days WHERE date = ? AND user_id = ?
    `),

    // Получить статистику для пользователя
    getStats: db.prepare(`
      SELECT
        COUNT(DISTINCT date) as total_days,
        COUNT(*) as total_entries,
        MIN(date) as first_day,
        MAX(date) as last_day
      FROM entries
      WHERE user_id = ?
    `)
  };
}

class DiaryModel {
  // Инициализация prepared statements
  static init() {
    initStatements();
  }

  // Получить все дни с метаданными для пользователя
  static getAllDays(userId) {
    try {
      if (!statements) this.init();
      const daysData = statements.getAllDays.all(userId);

      return daysData.map(day => {
        let lastEntry = null;

        if (day.last_entry_id) {
          lastEntry = statements.getLastEntry.get(day.last_entry_id, userId);
        }

        return {
          date: day.date,
          displayDate: formatDateForDisplay(day.date),
          entriesCount: day.entries_count,
          lastEntry: lastEntry ? {
            id: lastEntry.id,
            time: lastEntry.time,
            text: lastEntry.text,
            createdAt: lastEntry.created_at
          } : null
        };
      });
    } catch (error) {
      console.error('Ошибка при получении списка дней:', error);
      throw error;
    }
  }

  // Получить день с записями для пользователя
  static getDay(date, userId) {
    try {
      if (!statements) this.init();
      const entries = statements.getDayEntries.all(date, userId);

      return {
        date,
        displayDate: formatDateForDisplay(date),
        entries: entries.map(entry => ({
          id: entry.id,
          time: entry.time,
          text: entry.text,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        }))
      };
    } catch (error) {
      console.error('Ошибка при получении дня:', error);
      throw error;
    }
  }

  // Получить сегодняшний день для пользователя
  static getToday(userId) {
    try {
      const today = getCurrentDate();

      // Создаем день если не существует
      this.ensureDayExists(today, userId);

      const dayData = this.getDay(today, userId);

      return {
        ...dayData,
        displayDate: 'Сегодня',
        currentTime: getCurrentTime()
      };
    } catch (error) {
      console.error('Ошибка при получении сегодняшнего дня:', error);
      throw error;
    }
  }

  // Добавить запись в сегодня для пользователя
  static createTodayEntry(text, userId, time = null) {
    try {
      if (!statements) this.init();
      const today = getCurrentDate();
      const entryTime = time || getCurrentTime();

      // Создаем день если не существует
      this.ensureDayExists(today, userId);

      // Добавляем запись
      const result = statements.insertEntry.run(today, userId, entryTime, text);

      return {
        id: result.lastInsertRowid,
        time: entryTime,
        text,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
      throw error;
    }
  }

  // Убедиться что день существует в таблице дней для пользователя
  static ensureDayExists(date, userId) {
    try {
      if (!statements) this.init();
      const exists = statements.dayExists.get(date, userId);

      if (!exists) {
        const displayDate = formatDateForDisplay(date);
        statements.upsertDay.run(date, userId, displayDate);
      }
    } catch (error) {
      console.error('Ошибка при создании дня:', error);
      throw error;
    }
  }

  // Получить статистику дневника для пользователя
  static getStatistics(userId) {
    try {
      if (!statements) this.init();
      const stats = statements.getStats.get(userId);

      return {
        totalDays: stats.total_days || 0,
        totalEntries: stats.total_entries || 0,
        firstDay: stats.first_day,
        lastDay: stats.last_day,
        averageEntriesPerDay: stats.total_days > 0 ?
          Math.round((stats.total_entries / stats.total_days) * 10) / 10 : 0
      };
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      throw error;
    }
  }

  // Очистка всех данных (для разработки)
  static clearAllData() {
    try {
      db.prepare('DELETE FROM entries').run();
      db.prepare('DELETE FROM days').run();
      console.log('🗑️  Все данные удалены');
    } catch (error) {
      console.error('Ошибка при очистке данных:', error);
      throw error;
    }
  }

  // Экспорт данных в JSON для пользователя
  static exportToJSON(userId) {
    try {
      if (!statements) this.init();
      const days = statements.getAllDays.all(userId);
      const exportData = {};

      days.forEach(day => {
        const entries = statements.getDayEntries.all(day.date, userId);
        exportData[day.date] = entries;
      });

      return exportData;
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      throw error;
    }
  }
}

module.exports = DiaryModel;
