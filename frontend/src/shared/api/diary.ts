import axios from 'axios';
import { DiaryDay, DayListItem, TodayResponse, DiaryEntry, CreateEntryRequest, User, LoginRequest, RegisterRequest, AuthResponse } from './types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена ко всем запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок аутентификации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен недействителен или истек
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Регистрация нового пользователя
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Вход в систему
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Получить информацию о текущем пользователе
  me: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  // Выход из системы
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  // Проверить доступность username
  checkUsername: async (username: string): Promise<{ available: boolean; message: string }> => {
    const response = await api.post<{ available: boolean; message: string }>('/auth/check-username', { username });
    return response.data;
  },

  // Проверить доступность email
  checkEmail: async (email: string): Promise<{ available: boolean; message: string }> => {
    const response = await api.post<{ available: boolean; message: string }>('/auth/check-email', { email });
    return response.data;
  },

  // Проверить валидность токена
  validateToken: async (token: string): Promise<{ valid: boolean; user?: User; error?: string }> => {
    const response = await api.post<{ valid: boolean; user?: User; error?: string }>('/auth/validate', { token });
    return response.data;
  },
};

export const diaryApi = {
  // Получить список всех дней
  getAllDays: async (): Promise<DayListItem[]> => {
    const response = await api.get<DayListItem[]>('/days');
    return response.data;
  },

  // Получить записи за конкретный день
  getDay: async (date: string): Promise<DiaryDay> => {
    const response = await api.get<DiaryDay>(`/days/${date}`);
    return response.data;
  },

  // Получить сегодняшний день
  getToday: async (): Promise<TodayResponse> => {
    const response = await api.get<TodayResponse>('/today');
    return response.data;
  },

  // Добавить новую запись ТОЛЬКО в сегодняшний день
  createTodayEntry: async (entryData: CreateEntryRequest): Promise<DiaryEntry> => {
    const response = await api.post<DiaryEntry>(`/today/entries`, entryData);
    return response.data;
  },

  // Получить статистику дневника
  getStatistics: async (): Promise<{
    totalDays: number;
    totalEntries: number;
    firstDay: string | null;
    lastDay: string | null;
    averageEntriesPerDay: number;
  }> => {
    const response = await api.get('/statistics');
    return response.data;
  },

  // Экспорт данных в JSON
  exportData: async (): Promise<Blob> => {
    const response = await api.get('/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Редактирование и удаление запрещено - это дневник!
};

// Утилиты для работы с аутентификацией
export const authUtils = {
  // Сохранить данные аутентификации
  saveAuthData: (authData: AuthResponse) => {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('userData', JSON.stringify(authData.user));
  },

  // Получить сохраненные данные пользователя
  getUserData: (): User | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Получить токен
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Проверить, аутентифицирован ли пользователь
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Очистить данные аутентификации
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
};
