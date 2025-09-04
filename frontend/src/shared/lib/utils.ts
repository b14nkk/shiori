import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Сегодня'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Вчера'
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getCurrentTime(): string {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

export function getRecordWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'запись'
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'записи'
  } else {
    return 'записей'
  }
}
