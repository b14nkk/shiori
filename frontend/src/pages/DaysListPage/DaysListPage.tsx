import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui';
import { DiaryDayCard } from '../../entities/diary-day';
import { diaryApi } from '../../shared/api/diary';
import { DayListItem } from '../../shared/api/types';
import styles from './DaysListPage.module.scss';

export interface DaysListPageProps {
  onDaySelect: (date: string) => void;
  onShowAddForm: () => void;
}

export const DaysListPage: React.FC<DaysListPageProps> = ({
  onDaySelect,
  onShowAddForm
}) => {
  const [days, setDays] = useState<DayListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    try {
      setLoading(true);
      setError(null);
      const daysData = await diaryApi.getAllDays();
      setDays(daysData);
    } catch (err) {
      setError('Ошибка при загрузке дней');
      console.error('Error loading days:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shiori</h1>
        <p className={styles.subtitle}>Ваш личный дневник</p>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}



      <div className={styles.daysList}>
        {days.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Пока нет записей</h3>
            <p>Начните вести дневник прямо сегодня!</p>
          </div>
        ) : (
          days.map(day => (
            <DiaryDayCard
              key={day.date}
              day={day}
              onClick={onDaySelect}
              className={styles.dayCard}
            />
          ))
        )}
      </div>

      <Button
        variant="fab"
        onClick={onShowAddForm}
        className={styles.fab}
      >
        +
      </Button>
    </div>
  );
};
