#!/bin/bash

# Shiori Diary - Скрипт быстрого деплоя
# Версия: 3.0.0
# Дата: 2024

set -e  # Останавливаться при ошибках

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для цветного вывода
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Заголовок
echo ""
echo -e "${BLUE}🚀 Shiori Diary - Скрипт быстрого деплоя${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Проверка системы
info "Проверка системы и зависимостей..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    error "Docker не установлен! Установите Docker и попробуйте снова."
    echo "Инструкции: https://docs.docker.com/get-docker/"
    exit 1
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose не установлен! Установите Docker Compose и попробуйте снова."
    echo "Инструкции: https://docs.docker.com/compose/install/"
    exit 1
fi

success "Docker и Docker Compose найдены"

# Проверка на root
if [ "$EUID" -eq 0 ]; then
    warning "Скрипт запущен от root. Рекомендуется использовать обычного пользователя с правами sudo."
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Создание директории для данных
info "Создание директории для данных..."
mkdir -p ./data
chmod 755 ./data
success "Директория ./data создана"

# Создание .env файла если не существует
if [ ! -f .env ]; then
    info "Создание .env файла..."

    # Генерация случайного JWT секрета
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)

    cat > .env << EOF
# Shiori Diary - Переменные окружения
# Автоматически сгенерирован $(date)

# JWT настройки
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Backend настройки
NODE_ENV=production
PORT=3001

# Frontend настройки
VITE_API_URL=http://localhost:3001

# Настройки деплоя
COMPOSE_PROJECT_NAME=shiori
EOF

    success ".env файл создан с безопасным JWT секретом"
else
    info ".env файл уже существует, пропускаем..."
fi

# Выбор режима деплоя
echo ""
info "Выберите режим деплоя:"
echo "1) Разработка (development) - с hot reload"
echo "2) Продакшн (production) - оптимизированная сборка"
echo "3) Только перезапуск существующих контейнеров"
echo "4) Остановить все сервисы"
echo "5) Показать логи"
echo "6) Показать статус"

read -p "Выберите опцию (1-6): " deploy_option

case $deploy_option in
    1)
        info "Запуск в режиме разработки..."

        # Остановка production контейнеров если запущены
        docker-compose down 2>/dev/null || true

        # Установка зависимостей
        info "Установка зависимостей..."
        npm run install:all

        # Запуск в dev режиме
        info "Запуск серверов разработки..."
        npm run dev
        ;;

    2)
        info "Запуск в production режиме..."

        # Остановка существующих контейнеров
        info "Остановка существующих контейнеров..."
        docker-compose down 2>/dev/null || true

        # Сборка и запуск
        info "Сборка Docker образов..."
        docker-compose build --no-cache

        info "Запуск контейнеров..."
        docker-compose up -d

        # Ожидание запуска
        info "Ожидание запуска сервисов..."
        sleep 10

        # Проверка здоровья
        info "Проверка состояния сервисов..."
        if docker-compose ps | grep -q "Up"; then
            success "Сервисы успешно запущены!"
            echo ""
            echo -e "${GREEN}🌐 Приложение доступно по адресу: http://localhost${NC}"
            echo -e "${GREEN}🔧 API доступно по адресу: http://localhost:3001${NC}"
            echo ""
            info "Полезные команды:"
            echo "  docker-compose logs -f          # Просмотр логов"
            echo "  docker-compose ps               # Статус контейнеров"
            echo "  docker-compose down             # Остановка"
            echo "  docker-compose restart          # Перезапуск"
        else
            error "Ошибка при запуске сервисов!"
            echo ""
            warning "Показываю логи для диагностики:"
            docker-compose logs --tail=20
        fi
        ;;

    3)
        info "Перезапуск существующих контейнеров..."
        docker-compose restart
        success "Контейнеры перезапущены!"
        ;;

    4)
        info "Остановка всех сервисов..."
        docker-compose down
        success "Все сервисы остановлены!"
        ;;

    5)
        info "Показ логов (Ctrl+C для выхода)..."
        docker-compose logs -f
        ;;

    6)
        info "Статус сервисов:"
        echo ""
        docker-compose ps
        echo ""

        # Дополнительная информация
        if docker-compose ps | grep -q "Up"; then
            success "Сервисы работают!"
            echo ""
            echo -e "${GREEN}🌐 Frontend: http://localhost${NC}"
            echo -e "${GREEN}🔧 Backend API: http://localhost:3001${NC}"
            echo -e "${GREEN}📊 Статистика API: http://localhost:3001/api/statistics${NC}"
            echo ""

            # Проверка места на диске
            disk_usage=$(df -h . | awk 'NR==2 {print $5}')
            echo -e "💿 Использование диска: ${disk_usage}"

            # Размер базы данных
            if [ -f "./data/diary.db" ]; then
                db_size=$(ls -lh ./data/diary.db | awk '{print $5}')
                echo -e "🗄️  Размер базы данных: ${db_size}"
            fi
        else
            warning "Сервисы не запущены"
        fi
        ;;

    *)
        error "Неверная опция выбрана!"
        exit 1
        ;;
esac

# Дополнительные подсказки
echo ""
info "Дополнительные команды для управления:"
echo "  ./deploy.sh                    # Запуск этого скрипта"
echo "  docker-compose logs backend    # Логи только backend"
echo "  docker-compose logs frontend   # Логи только frontend"
echo "  docker-compose exec backend sh # Подключение к backend контейнеру"
echo ""

# Информация о безопасности
if [ "$deploy_option" = "2" ]; then
    echo ""
    warning "Рекомендации по безопасности для production:"
    echo "  1. Измените JWT_SECRET в .env файле"
    echo "  2. Используйте обратный прокси (nginx/Apache) с HTTPS"
    echo "  3. Настройте firewall для ограничения доступа"
    echo "  4. Регулярно делайте бэкапы базы данных (./data/diary.db)"
    echo "  5. Настройте мониторинг и логирование"
    echo ""
fi

success "Скрипт деплоя завершен!"
echo ""
