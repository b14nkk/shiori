import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './AuthForms.scss';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  onSuccess?: () => void;
  defaultMode?: AuthMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  defaultMode = 'login'
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // По умолчанию перенаправляем на главную страницу
      window.location.href = '/';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-page">
        <div className="auth-page__header">
          <div className="auth-page__logo">
            <h1 className="auth-page__brand">📖 Shiori</h1>
            <p className="auth-page__tagline">Ваш личный дневник</p>
          </div>

          <div className="auth-switcher">
            <div className="auth-switcher__tabs">
              <button
                type="button"
                className={`auth-switcher__tab ${
                  mode === 'login' ? 'auth-switcher__tab--active' : ''
                }`}
                onClick={() => setMode('login')}
              >
                Вход
              </button>
              <button
                type="button"
                className={`auth-switcher__tab ${
                  mode === 'register' ? 'auth-switcher__tab--active' : ''
                }`}
                onClick={() => setMode('register')}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>

        <div className="auth-page__content">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>

        <div className="auth-page__footer">
          <p className="auth-page__version">
            Shiori v3.0.0 - Безопасный личный дневник
          </p>
          <div className="auth-page__features">
            <span className="auth-page__feature">🔐 Безопасность</span>
            <span className="auth-page__feature">📱 Адаптивность</span>
            <span className="auth-page__feature">⚡ Быстрота</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Дополнительные стили для AuthPage
const authPageStyles = `
.auth-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.auth-page__header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-page__logo {
  margin-bottom: 2rem;
}

.auth-page__brand {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-page__tagline {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 400;
}

.auth-page__content {
  margin-bottom: 2rem;
}

.auth-page__footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
  opacity: 0.8;
}

.auth-page__version {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.auth-page__features {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.auth-page__feature {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

@media (max-width: 480px) {
  .auth-page__brand {
    font-size: 2rem;
  }

  .auth-page__tagline {
    font-size: 1rem;
  }

  .auth-page__features {
    gap: 1rem;
  }

  .auth-page__feature {
    font-size: 0.75rem;
  }
}
`;

// Добавляем стили в head если их еще нет
if (typeof document !== 'undefined' && !document.getElementById('auth-page-styles')) {
  const style = document.createElement('style');
  style.id = 'auth-page-styles';
  style.textContent = authPageStyles;
  document.head.appendChild(style);
}
