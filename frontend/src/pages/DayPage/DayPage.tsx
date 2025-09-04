import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui';
import { DiaryEntryCard } from '../../entities/diary-entry';
import { AddEntryForm } from '../../features/add-entry';
import { diaryApi } from '../../shared/api/diary';
import { DiaryDay } from '../../shared/api/types';
import { getCurrentDate } from '../../shared/lib/utils';
import styles from './DayPage.module.scss';

export interface DayPageProps {
  date?: string;
  onBack: () => void;
  onDataChange?: () => void;
}

export const DayPage: React.FC<DayPageProps> = ({
  date,
  onBack,
  onDataChange
}) => {
  const [day, setDay] = useState<DiaryDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);


  const isToday = !date || date === getCurrentDate();

  useEffect(() => {
    loadDay();
  }, [date]);

  const loadDay = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isToday) {
        const todayData = await diaryApi.getToday();
        setDay(todayData);
      } else {
        const dayData = await diaryApi.getDay(date!);
        setDay(dayData);
      }
    } catch (err) {
      setError('Ошибка при загрузке дня');
      console.error('Error loading day:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (text: string) => {
    try {
      setError(null);
      const newEntry = await diaryApi.createTodayEntry({ text });

      setDay(prev => prev ? {
        ...prev,
        entries: [...prev.entries, newEntry].sort((a, b) => a.time.localeCompare(b.time))
      } : null);

      setShowAddForm(false);
      onDataChange?.();
    } catch (err) {
      throw new Error('Ошибка при создании записи');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!day) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>День не найден</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button
          variant="ghost"
          onClick={onBack}
          className={styles.backButton}
        >
          ← Назад
        </Button>
        <h1 className={styles.title}>{day.displayDate}</h1>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.entriesList}>
        {day.entries.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Пока нет записей за этот день</h3>
            {isToday && (
              <p>Нажмите на "+" чтобы добавить первую запись</p>
            )}
          </div>
        ) : (
          day.entries.map(entry => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              className={styles.entryCard}
            />
          ))
        )}
      </div>

      {isToday && (
        <>
          {showAddForm && (
            <AddEntryForm
              onSubmit={handleAddEntry}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {!showAddForm && (
            <Button
              variant="fab"
              onClick={() => setShowAddForm(true)}
              className={styles.fab}
            >
              +
            </Button>
          )}
        </>
      )}
    </div>
  );
};
