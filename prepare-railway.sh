#!/bin/bash

# Shiori - Подготовка к Railway деплою
# Этот скрипт подготавливает проект для деплоя на Railway.app

set -e

echo "🚀 Подготовка Shiori к деплою на Railway..."
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта Shiori"
    exit 1
fi

# Создаем .nvmrc если его нет
if [ ! -f ".nvmrc" ]; then
    echo "📝 Создаем .nvmrc с версией Node.js 20..."
    echo "20" > .nvmrc
else
    echo "✅ .nvmrc уже существует"
fi

# Обновляем engines в корневом package.json
echo "⚙️  Обновляем package.json..."
if ! grep -q '"engines"' package.json; then
    # Добавляем engines секцию после version
    sed -i.bak '/"version"/a\
  "engines": {\
    "node": ">=20.0.0",\
    "npm": ">=9.0.0"\
  },' package.json && rm package.json.bak
    echo "✅ Добавлены engines в package.json"
else
    echo "✅ Engines уже настроены в package.json"
fi

# Создаем railway.json
echo "🚂 Создаем railway.json..."
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Создаем nixpacks.toml для точной настройки окружения
echo "📦 Создаем nixpacks.toml..."
cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = [
    "cd backend && npm install",
    "cd frontend && npm install && npm run build"
]

[start]
cmd = "cd backend && npm start"

[variables]
NODE_ENV = "production"
PORT = "3001"
EOF

# Создаем .railway директорию с переменными окружения шаблоном
echo "🔧 Создаем шаблон переменных окружения..."
mkdir -p .railway

cat > .railway/variables.example << 'EOF'
# Railway Environment Variables Template
# Скопируйте эти переменные в Railway Dashboard -> Variables

NODE_ENV=production
PORT=3001

# ВАЖНО: Смените это на свой секретный ключ!
JWT_SECRET=change-this-to-your-super-secret-jwt-key-32-chars-minimum

# Время жизни JWT токенов
JWT_EXPIRES_IN=7d

# Для production рекомендуется:
# - Сложный JWT_SECRET (32+ символов)
# - HTTPS домен
# - Регулярные бэкапы
EOF

# Создаем Procfile на всякий случай
echo "📋 Создаем Procfile..."
echo "web: cd backend && npm start" > Procfile

# Обновляем .gitignore для Railway файлов
echo "📝 Обновляем .gitignore..."
if ! grep -q ".railway" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Railway" >> .gitignore
    echo ".railway/variables" >> .gitignore
    echo ".railway/*.env" >> .gitignore
fi

# Проверяем и исправляем package.json в backend
echo "🔧 Проверяем backend package.json..."
cd backend

# Добавляем engines если их нет
if ! grep -q '"engines"' package.json; then
    # Добавляем engines секцию
    sed -i.bak '/"devDependencies"/i\
  "engines": {\
    "node": ">=18.0.0",\
    "npm": ">=8.0.0"\
  },' package.json && rm package.json.bak
    echo "✅ Добавлены engines в backend/package.json"
fi

cd ..

# Проверяем frontend
echo "🎨 Проверяем frontend..."
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json найден"
else
    echo "❌ Внимание: frontend/package.json не найден"
fi

echo ""
echo "✅ Подготовка к Railway деплою завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Коммитим изменения:"
echo "   git add ."
echo "   git commit -m 'Подготовка к Railway деплою'"
echo "   git push"
echo ""
echo "2. В Railway Dashboard:"
echo "   - New Project -> Deploy from GitHub repo"
echo "   - Выбираем репозиторий"
echo "   - Добавляем переменные из .railway/variables.example"
echo "   - Особенно важно: JWT_SECRET"
echo ""
echo "3. После деплоя:"
echo "   - Railway даст вам URL типа: https://shiori-production.up.railway.app"
echo "   - Регистрируемся и пользуемся!"
echo ""
echo "🔑 ВАЖНО: Обязательно смените JWT_SECRET на что-то уникальное!"
echo ""
echo "🎉 Готово! Теперь можно деплоить на Railway!"
