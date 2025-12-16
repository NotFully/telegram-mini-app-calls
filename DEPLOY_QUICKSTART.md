# Production Deploy - Быстрый старт

## 1. На сервере: Подготовка

```bash
# Клонировать репозиторий
git clone https://github.com/NotFully/telegram-mini-app-calls.git
cd telegram-mini-app-calls

# Инициализация
./deploy.sh init

# Редактировать .env (обязательно!)
nano .env
```

### Что изменить в .env:

```env
# Сгенерировать SECRET_KEY
SECRET_KEY=$(openssl rand -base64 32)

# Ваш бот токен
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# IP вашего сервера
SERVER_IP=123.45.67.89

# Пароли
POSTGRES_PASSWORD=$(openssl rand -base64 16)
TURN_PASSWORD=$(openssl rand -base64 16)

# Username бота
VITE_TELEGRAM_BOT_NAME=your_bot_username

# Email для Let's Encrypt
TRAEFIK_ADMIN_EMAIL=your@email.com
```

## 2. Настроить DNS

Добавить A-записи:

```
app.notfully.ru     -> YOUR_SERVER_IP
backend.notfully.ru -> YOUR_SERVER_IP
traefik.notfully.ru -> YOUR_SERVER_IP
```

Проверить:
```bash
dig app.notfully.ru +short
```

## 3. Обновить TURN конфигурацию

```bash
nano docker/coturn/turnserver.conf
```

Изменить:
```conf
external-ip=YOUR_SERVER_PUBLIC_IP
realm=notfully.ru
```

## 4. Запустить приложение

```bash
# Собрать образы
./deploy.sh build

# Запустить сервисы
./deploy.sh start

# Посмотреть логи
./deploy.sh logs
```

## 5. Применить миграции (если нужно)

```bash
docker exec -it telegram_calls_backend bash

# Создать таблицы
python -c "
from src.infrastructure.database.base import engine, Base
import asyncio
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(create_tables())
"

exit
```

## 6. Настроить Telegram Mini App

В @BotFather:

```
/newapp
[Выбрать бот]
Title: Telegram Calls
Description: Video and audio calls
Web App URL: https://app.notfully.ru
Short name: calls
```

## 7. Проверить работу

```bash
# Статус
./deploy.sh status

# Проверить frontend
curl -I https://app.notfully.ru

# Проверить backend
curl https://backend.notfully.ru/api/v1/health
```

## Полезные команды

```bash
# Просмотр логов
./deploy.sh logs              # Все сервисы
./deploy.sh logs backend      # Только backend
./deploy.sh logs traefik      # Только traefik

# Перезапуск
./deploy.sh restart

# Backup базы данных
./deploy.sh backup

# Обновление приложения
./deploy.sh update

# Остановка
./deploy.sh stop
```

## Troubleshooting

### SSL не работает

```bash
# Проверить логи Traefik
./deploy.sh logs traefik | grep -i acme

# Проверить что DNS настроен
dig app.notfully.ru +short

# Проверить что порты открыты
sudo netstat -tulpn | grep -E ':(80|443)'
```

### Backend не запускается

```bash
# Проверить логи
./deploy.sh logs backend

# Проверить переменные окружения
docker exec telegram_calls_backend env | grep DATABASE_URL
```

### Удалить всё и начать заново

```bash
# Остановить и удалить всё
docker-compose -f docker-compose.prod.yml down -v

# Удалить образы
docker rmi telegram-mini-app-calls_frontend
docker rmi telegram-mini-app-calls_backend

# Начать заново
./deploy.sh build
./deploy.sh start
```

## Готово!

Приложение доступно:
- 🌐 https://app.notfully.ru
- 🔧 https://backend.notfully.ru
- 📖 https://backend.notfully.ru/docs
