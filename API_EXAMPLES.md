# 🔗 API Examples

Примеры запросов к API Shiori Notes App с помощью curl.

## 🌐 Base URL

```
http://localhost:3001
```

## 📋 Endpoints

### 1. Проверка статуса сервера

```bash
curl http://localhost:3001/
```

**Ответ:**
```json
{
  "message": "Shiori Notes API работает!"
}
```

### 2. Получить все заметки

```bash
curl -X GET http://localhost:3001/api/notes
```

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "Первая заметка",
    "content": "Это моя первая заметка в приложении!",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Список покупок",
    "content": "Молоко, хлеб, масло, яйца",
    "createdAt": "2024-01-15T10:31:00.000Z"
  }
]
```

### 3. Получить заметку по ID

```bash
curl -X GET http://localhost:3001/api/notes/1
```

**Ответ:**
```json
{
  "id": 1,
  "title": "Первая заметка",
  "content": "Это моя первая заметка в приложении!",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Заметка не найдена:**
```bash
curl -X GET http://localhost:3001/api/notes/999
```
```json
{
  "error": "Заметка не найдена"
}
```

### 4. Создать новую заметку

```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новая заметка",
    "content": "Содержание новой заметки"
  }'
```

**Ответ:**
```json
{
  "id": 3,
  "title": "Новая заметка",
  "content": "Содержание новой заметки",
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

**Ошибка валидации:**
```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }'
```
```json
{
  "error": "Необходимо указать заголовок и содержание"
}
```

### 5. Обновить заметку

```bash
curl -X PUT http://localhost:3001/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Обновленная заметка",
    "content": "Новое содержание заметки"
  }'
```

**Ответ:**
```json
{
  "id": 1,
  "title": "Обновленная заметка",
  "content": "Новое содержание заметки",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z"
}
```

### 6. Удалить заметку

```bash
curl -X DELETE http://localhost:3001/api/notes/1
```

**Ответ:** HTTP 204 (No Content) - заметка удалена

**Заметка не найдена:**
```bash
curl -X DELETE http://localhost:3001/api/notes/999
```
```json
{
  "error": "Заметка не найдена"
}
```

## 🧪 Полный сценарий тестирования

```bash
#!/bin/bash

echo "🚀 Тестирование API Shiori Notes..."

# 1. Проверка сервера
echo "1. Проверка сервера..."
curl -s http://localhost:3001/ | jq

# 2. Получение всех заметок
echo -e "\n2. Получение всех заметок..."
curl -s http://localhost:3001/api/notes | jq

# 3. Создание новой заметки
echo -e "\n3. Создание новой заметки..."
NEW_NOTE=$(curl -s -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовая заметка API",
    "content": "Эта заметка создана через curl"
  }')
echo $NEW_NOTE | jq

# Извлекаем ID созданной заметки
NOTE_ID=$(echo $NEW_NOTE | jq -r '.id')
echo "Создана заметка с ID: $NOTE_ID"

# 4. Получение заметки по ID
echo -e "\n4. Получение заметки по ID ($NOTE_ID)..."
curl -s http://localhost:3001/api/notes/$NOTE_ID | jq

# 5. Обновление заметки
echo -e "\n5. Обновление заметки..."
curl -s -X PUT http://localhost:3001/api/notes/$NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Обновленная тестовая заметка",
    "content": "Эта заметка была обновлена через curl"
  }' | jq

# 6. Удаление заметки
echo -e "\n6. Удаление заметки..."
curl -s -X DELETE http://localhost:3001/api/notes/$NOTE_ID
echo "Заметка удалена"

# 7. Проверка удаления
echo -e "\n7. Проверка удаления..."
curl -s http://localhost:3001/api/notes/$NOTE_ID | jq

echo -e "\n✅ Тестирование завершено!"
```

## 📊 HTTP Status Codes

- `200 OK` - Успешный запрос
- `201 Created` - Ресурс создан
- `204 No Content` - Ресурс удален
- `400 Bad Request` - Ошибка в запросе
- `404 Not Found` - Ресурс не найден
- `500 Internal Server Error` - Ошибка сервера

## 💡 Полезные советы

### Красивый вывод JSON

```bash
# С помощью jq
curl -s http://localhost:3001/api/notes | jq

# С помощью python
curl -s http://localhost:3001/api/notes | python -m json.tool
```

### Сохранение в файл

```bash
# Сохранить все заметки в файл
curl -s http://localhost:3001/api/notes > notes.json

# Создать заметку из файла
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d @new-note.json
```

### Измерение времени отклика

```bash
curl -w "@curl-format.txt" -s http://localhost:3001/api/notes
```

Где `curl-format.txt` содержит:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## 🔧 Debugging

### Подробный вывод

```bash
# Показать заголовки запроса и ответа
curl -v http://localhost:3001/api/notes

# Показать только заголовки ответа
curl -I http://localhost:3001/api/notes
```

### Проверка доступности

```bash
# Проверить доступность сервера
curl -f http://localhost:3001/ && echo "Server is running" || echo "Server is down"
```
