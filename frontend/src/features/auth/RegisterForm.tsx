import React, { useState } from 'react';
import { authApi, authUtils } from '../../shared/api/diary';
import { RegisterRequest, AuthError } from '../../shared/api/types';
import './AuthForms.scss';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Состояния валидации в реальном времени
  const [validation, setValidation] = useState({
    username: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
  });

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return { isValid: false, message: 'Имя пользователя обязательно' };
    }
    if (username.length < 3) {
      return { isValid: false, message: 'Минимум 3 символа' };
    }
    if (username.length > 20) {
      return { isValid: false, message: 'Максимум 20 символов' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Только буквы, цифры и подчеркивания' };
    }
    return { isValid: true, message: '' };
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email обязателен' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Неверный формат email' };
    }
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return { isValid: false, message: 'Пароль обязателен' };
    }
    if (password.length < 6) {
      return { isValid: false, message: 'Минимум 6 символов' };
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      return { isValid: false, message: 'Должен содержать буквы и цифры' };
    }
    return { isValid: true, message: '' };
  };

  const validateConfirmPassword = (confirmPass: string, originalPass: string) => {
    if (!confirmPass.trim()) {
      return { isValid: false, message: 'Подтвердите пароль' };
    }
    if (confirmPass !== originalPass) {
      return { isValid: false, message: 'Пароли не совпадают' };
    }
    return { isValid: true, message: '' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      const confirmValidation = validateConfirmPassword(value, formData.password);
      setValidation(prev => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Валидация в реальном времени
      let fieldValidation;
      switch (name) {
        case 'username':
          fieldValidation = validateUsername(value);
          break;
        case 'email':
          fieldValidation = validateEmail(value);
          break;
        case 'password':
          fieldValidation = validatePassword(value);
          // Также проверяем подтверждение пароля
          const confirmValidation = validateConfirmPassword(confirmPassword, value);
          setValidation(prev => ({
            ...prev,
            confirmPassword: confirmValidation,
          }));
          break;
        default:
          fieldValidation = { isValid: true, message: '' };
      }

      setValidation(prev => ({
        ...prev,
        [name]: fieldValidation,
      }));
    }

    // Очищаем общую ошибку при вводе
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const usernameVal = validateUsername(formData.username);
    const emailVal = validateEmail(formData.email);
    const passwordVal = validatePassword(formData.password);
    const confirmPasswordVal = validateConfirmPassword(confirmPassword, formData.password);

    setValidation({
      username: usernameVal,
      email: emailVal,
      password: passwordVal,
      confirmPassword: confirmPasswordVal,
    });

    return usernameVal.isValid && emailVal.isValid && passwordVal.isValid && confirmPasswordVal.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.register(formData);

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
      console.error('Ошибка регистрации:', err);

      if (err.response?.data?.error) {
        setError(err.response.data.message || err.response.data.error);
      } else if (err.response?.data?.details) {
        setError(err.response.data.details.join(', '));
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
        <h2 className="auth-form__title">Регистрация в Shiori</h2>
        <p className="auth-form__subtitle">
          Создайте аккаунт, чтобы начать ведение личного дневника
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
          <label htmlFor="username" className="auth-form__label">
            Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`auth-form__input ${
              validation.username.message ?
                (validation.username.isValid ? 'auth-form__input--valid' : 'auth-form__input--invalid') : ''
            }`}
            placeholder="user123"
            disabled={isLoading}
            required
            autoComplete="username"
            autoFocus
            minLength={3}
            maxLength={20}
          />
          {validation.username.message && (
            <span className={`auth-form__field-message ${
              validation.username.isValid ? 'auth-form__field-message--valid' : 'auth-form__field-message--invalid'
            }`}>
              {validation.username.message}
            </span>
          )}
        </div>

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
            className={`auth-form__input ${
              validation.email.message ?
                (validation.email.isValid ? 'auth-form__input--valid' : 'auth-form__input--invalid') : ''
            }`}
            placeholder="example@email.com"
            disabled={isLoading}
            required
            autoComplete="email"
          />
          {validation.email.message && (
            <span className={`auth-form__field-message ${
              validation.email.isValid ? 'auth-form__field-message--valid' : 'auth-form__field-message--invalid'
            }`}>
              {validation.email.message}
            </span>
          )}
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
              className={`auth-form__input ${
                validation.password.message ?
                  (validation.password.isValid ? 'auth-form__input--valid' : 'auth-form__input--invalid') : ''
              }`}
              placeholder="Минимум 6 символов"
              disabled={isLoading}
              required
              autoComplete="new-password"
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
          {validation.password.message && (
            <span className={`auth-form__field-message ${
              validation.password.isValid ? 'auth-form__field-message--valid' : 'auth-form__field-message--invalid'
            }`}>
              {validation.password.message}
            </span>
          )}
        </div>

        <div className="auth-form__field">
          <label htmlFor="confirmPassword" className="auth-form__label">
            Подтвердите пароль
          </label>
          <div className="auth-form__password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className={`auth-form__input ${
                validation.confirmPassword.message ?
                  (validation.confirmPassword.isValid ? 'auth-form__input--valid' : 'auth-form__input--invalid') : ''
              }`}
              placeholder="Повторите пароль"
              disabled={isLoading}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              className="auth-form__password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {validation.confirmPassword.message && (
            <span className={`auth-form__field-message ${
              validation.confirmPassword.isValid ? 'auth-form__field-message--valid' : 'auth-form__field-message--invalid'
            }`}>
              {validation.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="auth-form__spinner" />
              Регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>
      </form>

      <div className="auth-form__footer">
        <p className="auth-form__switch">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            className="auth-form__switch-button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};
