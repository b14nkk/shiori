import React, { useEffect, useState } from 'react';
import { authUtils } from '../api/diary';
import { User } from '../api/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  onUnauthenticated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = authUtils.getToken();
      const userData = authUtils.getUserData();

      if (!token || !userData) {
        setIsAuthenticated(false);
        return;
      }

      // Проверяем валидность токена
      try {
        // Простая проверка на истечение токена
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenData.exp < currentTime) {
          // Токен истек
          authUtils.clearAuthData();
          setIsAuthenticated(false);
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Токен поврежден
        authUtils.clearAuthData();
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        // По умолчанию перенаправляем на страницу входа
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, onUnauthenticated]);

  // Показываем загрузку пока проверяем аутентификацию
  if (isAuthenticated === null) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Проверка аутентификации...</p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован, показываем fallback или ничего
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Аутентифицирован - показываем защищенный контент
  return (
    <div className="protected-route">
      {children}
    </div>
  );
};

// Хук для использования данных пользователя в защищенных компонентах
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const userData = authUtils.getUserData();
    const token = authUtils.getToken();

    if (userData && token) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    authUtils.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
};

// Стили для компонента загрузки
const loadingStyles = `
.protected-route-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-background, #f8fafc);
}

.loading-spinner {
  text-align: center;
  color: var(--color-text-secondary, #64748b);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border, #e2e8f0);
  border-top: 3px solid var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  font-size: 0.9rem;
  margin: 0;
}
`;

// Добавляем стили в head если их еще нет
if (typeof document !== 'undefined' && !document.getElementById('protected-route-styles')) {
  const style = document.createElement('style');
  style.id = 'protected-route-styles';
  style.textContent = loadingStyles;
  document.head.appendChild(style);
}
