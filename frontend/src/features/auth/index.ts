// Экспорт всех компонентов и утилит аутентификации
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { AuthPage } from './AuthPage';

// Реэкспорт API и утилит для удобства
export { authApi, authUtils } from '../../shared/api/diary';

// Типы для аутентификации
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthError,
} from '../../shared/api/types';
