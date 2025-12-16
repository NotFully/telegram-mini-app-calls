# Telegram Mini App с WebRTC Звонками

Полнофункциональное Telegram Mini App для аудио/видео звонков через WebRTC.

## Технологический Стек

### Frontend
- **React** + **TypeScript** + **Vite**
- **FSD (Feature-Sliced Design)** архитектура
- **Telegram Mini App SDK** (@telegram-apps/sdk)
- **Zustand** для state management
- **WebRTC** для видео/аудио связи

### Backend
- **Python 3.11+** + **FastAPI**
- **Clean Architecture** (Domain, Application, Infrastructure, Presentation layers)
- **SQLAlchemy 2.0** + **Alembic** для работы с БД
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и Pub/Sub
- **WebSocket** - signaling для WebRTC

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** - reverse proxy
- **Coturn** - TURN/STUN сервер для NAT traversal
- **PostgreSQL 16**
- **Redis 7**

## Архитектура

### Backend (Clean Architecture)
```
backend/src/
├── domain/          # Бизнес-логика (entities, repositories interfaces)
├── application/     # Use cases, DTOs
├── infrastructure/  # Database, WebSocket, External services
├── presentation/    # API routes, WebSocket endpoints
└── core/            # Configuration, dependencies
```

### Frontend (FSD)
```
frontend/src/
├── app/         # Providers, router, global styles
├── pages/       # Страницы (роуты)
├── widgets/     # Композитные блоки
├── features/    # Бизнес-фичи
├── entities/    # Бизнес-сущности
└── shared/      # Переиспользуемые ресурсы (UI kit, utils, API)
```

## Быстрый старт

### Требования
- **Docker** и **Docker Compose**
- **Python 3.11+** (для локальной разработки)
- **Node.js 20+** и **npm** (для локальной разработки)

### Запуск через Docker

```bash
# Клонировать репозиторий
git clone <repo-url>
cd telegram-mini-app-calls

# Создать .env файл
cp .env.example .env
# Отредактировать .env с вашими настройками

# Запустить все сервисы
docker-compose up -d --build

# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# Backend API Docs: http://localhost:8000/docs
```

### Локальная разработка

#### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac

# Установить зависимости
pip install -r requirements.txt

# Запустить PostgreSQL и Redis
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=calls postgres:16-alpine
docker run -d -p 6379:6379 redis:7-alpine

# Применить миграции
alembic upgrade head

# Запустить dev сервер
uvicorn src.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Создать .env файл
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_WS_URL=ws://localhost:8000" >> .env.local

# Запустить dev сервер
npm run dev
```

## Настройка Telegram Mini App

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Mini App URL в BotFather: `/newapp`
4. Укажите URL вашего frontend'а
5. Добавьте токен в `.env` файл: `TELEGRAM_BOT_TOKEN=your_token`

## Основные функции

- ✅ 1-to-1 видео/аудио звонки
- ✅ WebRTC соединение через TURN/STUN
- ✅ Управление камерой и микрофоном
- ✅ Создание и управление комнатами
- ✅ Signaling через WebSocket
- ✅ Telegram Mini App интеграция

## Дополнительные возможности (В планах)

- [ ] Групповые звонки
- [ ] Screen sharing
- [ ] Запись звонков
- [ ] Chat во время звонка
- [ ] История звонков
- [ ] Push уведомления

## API Documentation

После запуска backend, OpenAPI документация доступна по адресу:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Production Deployment

См. документацию в плане: [Plan](/.claude/plans/mellow-booping-eich.md)

Основные шаги:
1. Настроить VPS сервер
2. Установить Docker и Docker Compose
3. Настроить домен и SSL сертификаты
4. Запустить через `docker-compose up -d --build`
5. Настроить Coturn для TURN/STUN

## Лицензия

MIT

## Контакты

Создано для Telegram Mini Apps Contest
