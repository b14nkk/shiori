import React, { useState } from 'react';
import { Card, CardContent, Button, Textarea } from '../../shared/ui';
import { getCurrentTime } from '../../shared/lib/utils';
import styles from './AddEntryForm.module.scss';

export interface AddEntryFormProps {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const AddEntryForm: React.FC<AddEntryFormProps> = ({
  onSubmit,
  onCancel,
  className
}) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Введите текст записи');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      setError('Ошибка при сохранении записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <Card className={`${styles.form} ${className || ''}`}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className={styles.timeLabel}>
              {getCurrentTime()}
            </div>

            <Textarea
              placeholder="Что происходит?.."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.textarea}
              error={!!error}
              autoFocus
            />

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                type="submit"
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
