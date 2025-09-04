const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'shiori-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Генерация JWT токена
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Токен не предоставлен',
        message: 'Для доступа к этому ресурсу необходимо войти в систему'
      });
    }

    // Проверяем токен
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Токен истек',
            message: 'Необходимо войти в систему заново'
          });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            error: 'Недействительный токен',
            message: 'Токен поврежден или недействителен'
          });
        } else {
          return res.status(403).json({
            error: 'Ошибка токена',
            message: 'Не удалось проверить токен'
          });
        }
      }

      // Получаем данные пользователя
      const user = UserModel.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          error: 'Пользователь не найден',
          message: 'Пользователь больше не существует'
        });
      }

      // Добавляем пользователя в объект запроса
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Ошибка в middleware аутентификации:', error);
    return res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Внутренняя ошибка при проверке аутентификации'
    });
  }
}

// Опциональная аутентификация (не требует обязательного токена)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.userId);
    req.user = user;
  } catch (error) {
    req.user = null;
  }

  next();
}

// Проверка валидности токена (для фронтенда)
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.userId);

    if (!user) {
      return { valid: false, error: 'Пользователь не найден' };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Токен истек' };
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Недействительный токен' };
    } else {
      return { valid: false, error: 'Ошибка проверки токена' };
    }
  }
}

// Middleware для извлечения пользователя из токена (без проверки обязательности)
function extractUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = UserModel.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Игнорируем ошибки токена в этом middleware
    }
  }

  next();
}

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  validateToken,
  extractUser,
  JWT_SECRET
};
