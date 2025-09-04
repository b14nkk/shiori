const { db } = require('../database/init');
const bcrypt = require('bcryptjs');

// Prepared statements для работы с пользователями
let userStatements = null;

// Функция для инициализации prepared statements
function initUserStatements() {
  userStatements = {
    // Создать пользователя
    createUser: db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `),

    // Найти пользователя по email
    findByEmail: db.prepare(`
      SELECT id, username, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
    `),

    // Найти пользователя по username
    findByUsername: db.prepare(`
      SELECT id, username, email, password_hash, created_at, updated_at
      FROM users
      WHERE username = ?
    `),

    // Найти пользователя по ID
    findById: db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE id = ?
    `),

    // Обновить последний вход
    updateLastLogin: db.prepare(`
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `),

    // Проверить существование email
    emailExists: db.prepare(`
      SELECT 1 FROM users WHERE email = ?
    `),

    // Проверить существование username
    usernameExists: db.prepare(`
      SELECT 1 FROM users WHERE username = ?
    `)
  };
}

class UserModel {
  // Инициализация prepared statements
  static init() {
    if (!userStatements) {
      initUserStatements();
    }
  }

  // Создать нового пользователя
  static async create(userData) {
    try {
      this.init();
      const { username, email, password } = userData;

      // Проверяем уникальность email
      if (userStatements.emailExists.get(email)) {
        throw new Error('EMAIL_EXISTS');
      }

      // Проверяем уникальность username
      if (userStatements.usernameExists.get(username)) {
        throw new Error('USERNAME_EXISTS');
      }

      // Хешируем пароль
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const result = userStatements.createUser.run(username, email, passwordHash);

      return {
        id: result.lastInsertRowid,
        username,
        email,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  // Аутентификация пользователя
  static async authenticate(email, password) {
    try {
      this.init();

      // Находим пользователя по email
      const user = userStatements.findByEmail.get(email);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      // Обновляем время последнего входа
      userStatements.updateLastLogin.run(user.id);

      // Возвращаем данные пользователя без хеша пароля
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Ошибка при аутентификации:', error);
      throw error;
    }
  }

  // Найти пользователя по ID
  static findById(id) {
    try {
      this.init();
      const user = userStatements.findById.get(id);

      return user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      } : null;
    } catch (error) {
      console.error('Ошибка при поиске пользователя по ID:', error);
      throw error;
    }
  }

  // Найти пользователя по username
  static findByUsername(username) {
    try {
      this.init();
      const user = userStatements.findByUsername.get(username);

      return user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      } : null;
    } catch (error) {
      console.error('Ошибка при поиске пользователя по username:', error);
      throw error;
    }
  }

  // Найти пользователя по email
  static findByEmail(email) {
    try {
      this.init();
      const user = userStatements.findByEmail.get(email);

      return user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      } : null;
    } catch (error) {
      console.error('Ошибка при поиске пользователя по email:', error);
      throw error;
    }
  }

  // Валидация email
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Валидация пароля
  static validatePassword(password) {
    // Минимум 6 символов
    if (password.length < 6) {
      return { valid: false, error: 'Пароль должен быть минимум 6 символов' };
    }

    // Проверяем наличие букв и цифр
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return { valid: false, error: 'Пароль должен содержать буквы и цифры' };
    }

    return { valid: true };
  }

  // Валидация username
  static validateUsername(username) {
    // Длина от 3 до 20 символов
    if (username.length < 3 || username.length > 20) {
      return { valid: false, error: 'Имя пользователя должно быть от 3 до 20 символов' };
    }

    // Только буквы, цифры и подчеркивания
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return { valid: false, error: 'Имя пользователя может содержать только буквы, цифры и подчеркивания' };
    }

    return { valid: true };
  }

  // Полная валидация данных регистрации
  static validateRegistrationData(userData) {
    const { username, email, password } = userData;
    const errors = [];

    // Проверяем все поля
    if (!username || !email || !password) {
      errors.push('Все поля обязательны для заполнения');
      return { valid: false, errors };
    }

    // Валидация username
    const usernameValidation = this.validateUsername(username);
    if (!usernameValidation.valid) {
      errors.push(usernameValidation.error);
    }

    // Валидация email
    if (!this.validateEmail(email)) {
      errors.push('Неверный формат email');
    }

    // Валидация пароля
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.error);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = UserModel;
