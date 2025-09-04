import React, { useState } from 'react';
import { authApi, authUtils } from '../../shared/api/diary';
import { LoginRequest, AuthError } from '../../shared/api/types';
import './AuthForms.scss';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку при вводе
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email обязателен для заполнения');
      return false;
    }

    if (!formData.password.trim()) {
      setError('Пароль обязателен для заполнения');
      return false;
    }

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Неверный формат email');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);

      // Сохраняем данные аутентификации
      authUtils.saveAuthData(response);

      // Вызываем callback успеха
      if (onSuccess) {
        onSuccess();
      } else {
        // Перенаправляем на главную страницу
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Ошибка входа:', err);

      if (err.response?.data?.error) {
        setError(err.response.data.message || err.response.data.error);
      } else if (err.message) {
        setError(`Ошибка сети: ${err.message}`);
      } else {
        setError('Произошла неизвестная ошибка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h2 className="auth-form__title">Вход в Shiori</h2>
        <p className="auth-form__subtitle">
          Войдите в свой аккаунт, чтобы продолжить ведение дневника
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form__form">
        {error && (
          <div className="auth-form__error" role="alert">
            <span className="auth-form__error-icon">⚠️</span>
            <span className="auth-form__error-text">{error}</span>
          </div>
        )}

        <div className="auth-form__field">
          <label htmlFor="email" className="auth-form__label">
            Email адрес
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="auth-form__input"
            placeholder="example@email.com"
            disabled={isLoading}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="auth-form__field">
          <label htmlFor="password" className="auth-form__label">
            Пароль
          </label>
          <div className="auth-form__password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-form__input"
              placeholder="Введите пароль"
              disabled={isLoading}
              required
              autoComplete="current-password"
              minLength={6}
            />
            <button
              type="button"
              className="auth-form__password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="auth-form__spinner" />
              Вход...
            </>
          ) : (
            'Войти'
          )}
        </button>
      </form>

      <div className="auth-form__footer">
        <p className="auth-form__switch">
          Нет аккаунта?{' '}
          <button
            type="button"
            className="auth-form__switch-button"
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
};
