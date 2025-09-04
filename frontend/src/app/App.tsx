import { useState, useEffect } from 'react';
import { DaysListPage } from '../pages/DaysListPage';
import { DayPage } from '../pages/DayPage';
import { AddEntryForm } from '../features/add-entry';
import { diaryApi, authUtils } from '../shared/api/diary';
import { AuthPage } from '../features/auth';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { User } from '../shared/api/types';
import './App.scss';

type ViewMode = 'auth' | 'days' | 'day';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authUtils.getToken();
        const userData = authUtils.getUserData();

        if (!token || !userData) {
          setViewMode('auth');
          setIsLoading(false);
          return;
        }

        // Проверяем валидность токена
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenData.exp < currentTime) {
          // Токен истек
          authUtils.clearAuthData();
          setViewMode('auth');
          setIsLoading(false);
          return;
        }

        setUser(userData);
        setViewMode('days');
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        authUtils.clearAuthData();
        setViewMode('auth');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    const userData = authUtils.getUserData();
    if (userData) {
      setUser(userData);
      setViewMode('days');
    }
  };

  const handleLogout = () => {
    authUtils.clearAuthData();
    setUser(null);
    setViewMode('auth');
    setSelectedDate(undefined);
    setShowAddForm(false);
  };

  const handleDaySelect = (date: string) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleBack = () => {
    setSelectedDate(undefined);
    setViewMode('days');
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleAddEntry = async (text: string) => {
    try {
      setError(null);
      await diaryApi.createTodayEntry({ text });
      setShowAddForm(false);
      // If we're on the days list, we might want to refresh it
      if (viewMode === 'days') {
        // Page will refresh data automatically when it mounts
        window.location.reload();
      }
    } catch (err) {
      throw new Error('Ошибка при создании записи');
    }
  };

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>📖 Shiori</h2>
          <p>Загружаем ваш дневник...</p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован, показываем форму входа
  if (viewMode === 'auth') {
    return (
      <div className="app">
        <AuthPage onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-toast">
          {error}
        </div>
      )}

      {/* Заголовок с информацией о пользователе */}
      <header className="app-header">
        <div className="app-header__content">
          <h1 className="app-header__title">📖 Shiori</h1>
          <div className="app-header__user">
            <span className="app-header__username">
              Привет, {user?.username}!
            </span>
            <button
              className="app-header__logout"
              onClick={handleLogout}
              title="Выйти из системы"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {viewMode === 'days' ? (
          <DaysListPage
            onDaySelect={handleDaySelect}
            onShowAddForm={handleShowAddForm}
          />
        ) : (
          <DayPage
            date={selectedDate}
            onBack={handleBack}
            onDataChange={() => {
              // Refresh data if needed
              setShowAddForm(false);
            }}
          />
        )}

        {showAddForm && (
          <AddEntryForm
            onSubmit={handleAddEntry}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
