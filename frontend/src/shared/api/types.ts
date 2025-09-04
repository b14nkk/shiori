export interface DiaryEntry {
  id: number;
  time: string; // HH:MM format
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DiaryDay {
  date: string; // YYYY-MM-DD format
  displayDate: string; // "Сегодня", "Вчера", или полная дата
  entries: DiaryEntry[];
}

export interface DayListItem {
  date: string; // YYYY-MM-DD format
  displayDate: string; // "Сегодня", "Вчера", или полная дата
  entriesCount: number;
  lastEntry?: DiaryEntry;
}

export interface TodayResponse extends DiaryDay {
  currentTime: string; // HH:MM format
}

export interface CreateEntryRequest {
  text: string;
  time?: string; // опционально, если не указано - текущее время
}

// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface AuthError {
  error: string;
  message: string;
  details?: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Редактирование запрещено - это дневник!
