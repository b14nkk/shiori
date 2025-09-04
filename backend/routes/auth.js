const express = require('express');
const UserModel = require('../models/user');
const { generateToken, authenticateToken, validateToken } = require('../middleware/auth');

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Валидация входных данных
    const validation = UserModel.validateRegistrationData({ username, email, password });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        message: 'Проверьте правильность введенных данных',
        details: validation.errors
      });
    }

    // Создаем пользователя
    const user = await UserModel.create({ username, email, password });

    // Генерируем токен
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);

    if (error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({
        error: 'Email уже используется',
        message: 'Пользователь с таким email уже существует'
      });
    }

    if (error.message === 'USERNAME_EXISTS') {
      return res.status(409).json({
        error: 'Имя пользователя занято',
        message: 'Выберите другое имя пользователя'
      });
    }

    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось зарегистрировать пользователя'
    });
  }
});

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        error: 'Неполные данные',
        message: 'Email и пароль обязательны для заполнения'
      });
    }

    if (!UserModel.validateEmail(email)) {
      return res.status(400).json({
        error: 'Неверный формат email',
        message: 'Проверьте правильность введенного email'
      });
    }

    // Аутентификация пользователя
    const user = await UserModel.authenticate(email, password);

    // Генерируем токен
    const token = generateToken(user.id);

    res.json({
      message: 'Успешный вход в систему',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Ошибка при входе в систему:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Пользователь не найден',
        message: 'Пользователь с таким email не существует'
      });
    }

    if (error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({
        error: 'Неверный пароль',
        message: 'Проверьте правильность введенного пароля'
      });
    }

    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось войти в систему'
    });
  }
});

// Получить информацию о текущем пользователе
router.get('/me', authenticateToken, (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить данные пользователя'
    });
  }
});

// Проверить валидность токена
router.post('/validate', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Токен не предоставлен',
        message: 'Необходимо передать токен для проверки'
      });
    }

    const validation = validateToken(token);

    if (validation.valid) {
      res.json({
        valid: true,
        user: validation.user,
        expiresAt: validation.expiresAt
      });
    } else {
      res.status(401).json({
        valid: false,
        error: validation.error
      });
    }

  } catch (error) {
    console.error('Ошибка при валидации токена:', error);
    res.status(500).json({
      valid: false,
      error: 'Ошибка сервера при валидации токена'
    });
  }
});

// Выход из системы (опциональный эндпоинт для логики фронтенда)
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // В JWT токенах нет серверного состояния, поэтому просто отправляем успешный ответ
    // Фронтенд должен удалить токен из localStorage/sessionStorage
    res.json({
      message: 'Успешный выход из системы',
      instructions: 'Удалите токен из локального хранилища'
    });
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось выйти из системы'
    });
  }
});

// Проверить доступность username
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: 'Username не предоставлен',
        message: 'Необходимо указать имя пользователя'
      });
    }

    const validation = UserModel.validateUsername(username);

    if (!validation.valid) {
      return res.status(400).json({
        available: false,
        error: validation.error
      });
    }

    // Используем метод из модели для проверки существования
    const exists = UserModel.findByUsername && UserModel.findByUsername(username);

    res.json({
      available: !exists,
      message: exists ? 'Имя пользователя уже занято' : 'Имя пользователя доступно'
    });

  } catch (error) {
    console.error('Ошибка при проверке username:', error);
    res.status(500).json({
      available: false,
      error: 'Ошибка сервера при проверке имени пользователя'
    });
  }
});

// Проверить доступность email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email не предоставлен',
        message: 'Необходимо указать email'
      });
    }

    if (!UserModel.validateEmail(email)) {
      return res.status(400).json({
        available: false,
        error: 'Неверный формат email'
      });
    }

    // Используем метод из модели для проверки существования
    const exists = UserModel.findByEmail && UserModel.findByEmail(email);

    res.json({
      available: !exists,
      message: exists ? 'Email уже используется' : 'Email доступен'
    });

  } catch (error) {
    console.error('Ошибка при проверке email:', error);
    res.status(500).json({
      available: false,
      error: 'Ошибка сервера при проверке email'
    });
  }
});

module.exports = router;
