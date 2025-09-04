import React from 'react';
import { Card, CardContent } from '../../shared/ui';
import { DiaryEntry } from '../../shared/api/types';
import styles from './DiaryEntryCard.module.scss';

export interface DiaryEntryCardProps {
  entry: DiaryEntry;
  className?: string;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  entry,
  className
}) => {
  return (
    <Card className={className}>
      <CardContent>
        <div className={styles.entry}>
          <div className={styles.time}>
            {entry.time}
          </div>
          <div className={styles.text}>
            {entry.text}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
