import React from 'react';
import { Card, CardHeader, CardContent } from '../../shared/ui';
import { DayListItem } from '../../shared/api/types';
import { getRecordWord } from '../../shared/lib/utils';
import styles from './DiaryDayCard.module.scss';

export interface DiaryDayCardProps {
  day: DayListItem;
  onClick: (date: string) => void;
  className?: string;
}

export const DiaryDayCard: React.FC<DiaryDayCardProps> = ({
  day,
  onClick,
  className
}) => {
  return (
    <Card
      interactive
      className={className}
      onClick={() => onClick(day.date)}
    >
      <CardHeader>
        <div className={styles.header}>
          <h3 className={styles.title}>{day.displayDate}</h3>
          <span className={styles.count}>
            {day.entriesCount} {getRecordWord(day.entriesCount)}
          </span>
        </div>
      </CardHeader>

      {day.lastEntry && (
        <CardContent>
          <div className={styles.lastEntry}>
            <span className={styles.time}>{day.lastEntry.time}</span>
            <span className={styles.text}>{day.lastEntry.text}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
