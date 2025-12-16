# 🚀 Quick Start Guide

## Запуск проекта за 3 минуты

### 1. Клонировать репозиторий
```bash
git clone <repo-url>
cd telegram-mini-app-calls
```

### 2. Создать .env файл
```bash
cp .env.example .env
```

**Важно!** Отредактируйте `.env` файл:
- `SECRET_KEY` - уже сгенерирован: `8ExAMCHacXKSz4wSwmoIYuTzXviL4U4e2ci8o6D-Bpc`
- `TELEGRAM_BOT_TOKEN` - получите у [@BotFather](https://t.me/BotFather)

### 3. Запустить все сервисы
```bash
make dev
```

Или без Makefile:
```bash
docker-compose up -d --build
```

### 4. Применить миграции базы данных
```bash
make migrate
```

Или:
```bash
docker-compose exec backend alembic upgrade head
```

## ✅ Проверка работоспособности

После запуска сервисы доступны по адресам:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | http://localhost | React SPA с Telegram Mini App |
| **Backend API** | http://localhost:8000 | FastAPI REST + WebSocket |
| **API Docs (Swagger)** | http://localhost:8000/docs | Интерактивная документация |
| **API Docs (ReDoc)** | http://localhost:8000/redoc | Альтернативная документация |
| **PostgreSQL** | localhost:5433 | База данных |
| **Redis** | localhost:6380 | Кэш и Pub/Sub |

### Проверка сервисов

```bash
# Проверить статус всех контейнеров
docker-compose ps

# Посмотреть логи
make logs

# Посмотреть логи backend
make logs-backend

# Посмотреть логи frontend
make logs-frontend
```

### Тестовый запрос к API

```bash
# Проверить health check
curl http://localhost:8000/

# Открыть Swagger UI
open http://localhost:8000/docs  # macOS
xdg-open http://localhost:8000/docs  # Linux
```

## 🛠️ Полезные команды

```bash
make help          # Показать все доступные команды
make build         # Собрать Docker контейнеры
make up            # Запустить все сервисы
make down          # Остановить все сервисы
make restart       # Перезапустить backend и frontend
make migrate       # Применить миграции БД
make migration     # Создать новую миграцию
make shell         # Открыть shell в backend контейнере
make shell-db      # Открыть psql в PostgreSQL
make clean         # Удалить контейнеры и volumes
```

## 🔑 Учётные данные

### PostgreSQL
- **Host**: localhost:5433 (внутри Docker: postgres:5432)
- **User**: telegram_calls
- **Password**: telegram_calls_pass
- **Database**: telegram_calls

### Redis
- **Host**: localhost:6380 (внутри Docker: redis:6379)
- **Password**: нет

## 📝 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather):
   ```
   /newbot
   ```

2. Получите токен и добавьте в `.env`:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

3. Создайте Mini App:
   ```
   /newapp
   ```

4. Укажите URL фронтенда:
   - Для локальной разработки: `http://localhost`
   - Для продакшена: `https://your-domain.com`

## 🐛 Решение проблем

### Порты заняты

Если порты 80, 8000, 5433 или 6380 заняты:

1. Найдите процесс:
   ```bash
   lsof -i :8000  # Для порта 8000
   ```

2. Остановите процесс или измените порт в `docker-compose.yml`

### Ошибки миграций

```bash
# Сбросить миграции
docker-compose down -v
docker-compose up -d
make migrate
```

### Backend не запускается

```bash
# Посмотреть логи
docker-compose logs backend

# Пересобрать backend
docker-compose build backend
docker-compose up -d backend
```

## 📚 Дополнительная информация

- Полная документация: [README.md](README.md)
- API документация: http://localhost:8000/docs
- Архитектура проекта: см. README.md

## 🎉 Готово!

Проект запущен и готов к разработке!

Откройте http://localhost в браузере чтобы увидеть frontend.
