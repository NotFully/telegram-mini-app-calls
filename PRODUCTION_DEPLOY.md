# Production Deployment Guide

Инструкция по развертыванию приложения на production сервере с Traefik 1.7.

## Требования

- Ubuntu/Debian сервер с публичным IP
- Docker и Docker Compose установлены
- Домен **notfully.ru** с настроенными DNS записями
- Порты 80, 443, 3478 (для TURN) открыты в firewall

## 1. Настройка DNS

Добавьте следующие A-записи в DNS вашего домена:

```
app.notfully.ru     -> YOUR_SERVER_IP
backend.notfully.ru -> YOUR_SERVER_IP
traefik.notfully.ru -> YOUR_SERVER_IP
```

Проверить можно командой:
```bash
dig app.notfully.ru +short
dig backend.notfully.ru +short
dig traefik.notfully.ru +short
```

## 2. Подготовка сервера

### Установка Docker (если не установлен)

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезайти в систему для применения изменений группы
exit
```

### Клонирование репозитория

```bash
cd ~
git clone https://github.com/NotFully/telegram-mini-app-calls.git
cd telegram-mini-app-calls
```

## 3. Настройка окружения

### Создать файл .env для production

```bash
cp .env.prod .env
```

### Отредактировать .env файл

```bash
nano .env
```

**Обязательно измените следующие значения:**

```env
# Сгенерировать SECRET_KEY (32 символа)
SECRET_KEY=$(openssl rand -base64 32)

# Ваш токен от @BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Публичный IP вашего сервера
SERVER_IP=123.45.67.89

# Безопасный пароль для PostgreSQL
POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Безопасный пароль для TURN сервера
TURN_PASSWORD=$(openssl rand -base64 16)

# Username вашего бота (без @)
VITE_TELEGRAM_BOT_NAME=your_bot_username

# Email для Let's Encrypt
TRAEFIK_ADMIN_EMAIL=your_email@example.com
```

### Создать файл acme.json для SSL сертификатов

```bash
touch docker/traefik/acme.json
chmod 600 docker/traefik/acme.json
```

### Создать внешнюю сеть для Traefik

```bash
docker network create web
```

## 4. Настройка Firewall

Открыть необходимые порты:

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3478/tcp   # TURN
sudo ufw allow 3478/udp   # TURN
sudo ufw enable

# Или iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3478 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 3478 -j ACCEPT
```

## 5. Обновить TURN конфигурацию

Отредактировать файл `docker/coturn/turnserver.conf`:

```bash
nano docker/coturn/turnserver.conf
```

Заменить:
```conf
listening-ip=0.0.0.0
external-ip=YOUR_SERVER_PUBLIC_IP
realm=notfully.ru
```

## 6. Пересобрать frontend с правильными переменными окружения

Нужно пересобрать frontend образ с production URL'ами:

```bash
# Создать production Dockerfile для frontend
cat > docker/frontend.prod.Dockerfile <<'EOF'
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_TELEGRAM_BOT_NAME

# Build the application with env vars
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
```

Обновить docker-compose.prod.yml для frontend:

```yaml
  frontend:
    build:
      context: .
      dockerfile: docker/frontend.prod.Dockerfile
      args:
        - VITE_API_URL=https://backend.notfully.ru
        - VITE_WS_URL=wss://backend.notfully.ru
        - VITE_TELEGRAM_BOT_NAME=${VITE_TELEGRAM_BOT_NAME}
```

## 7. Запуск приложения

### Сборка и запуск всех сервисов

```bash
# Загрузить переменные окружения
export $(cat .env | xargs)

# Собрать образы
docker-compose -f docker-compose.prod.yml build --no-cache

# Запустить в detached режиме
docker-compose -f docker-compose.prod.yml up -d

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs -f
```

### Применить миграции базы данных

```bash
# Зайти в контейнер backend
docker exec -it telegram_calls_backend bash

# Применить миграции (если есть alembic)
# alembic upgrade head

# Или создать таблицы напрямую
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

## 8. Проверка работы

### Проверить статус контейнеров

```bash
docker-compose -f docker-compose.prod.yml ps
```

Все сервисы должны быть в статусе `Up`:
- telegram_calls_traefik
- telegram_calls_frontend
- telegram_calls_backend
- telegram_calls_postgres
- telegram_calls_redis
- telegram_calls_coturn

### Проверить SSL сертификаты

Подождите 1-2 минуты пока Let's Encrypt выдаст сертификаты, затем проверьте:

```bash
# Проверить acme.json
cat docker/traefik/acme.json | jq '.Certificates[] | .Domain.Main'
```

### Проверить доступность сервисов

```bash
# Frontend
curl -I https://app.notfully.ru

# Backend API
curl https://backend.notfully.ru/api/v1/health

# Traefik Dashboard (если настроен)
# Откройте в браузере: https://traefik.notfully.ru
```

### Тест WebSocket соединения

```bash
wscat -c wss://backend.notfully.ru/ws
```

## 9. Настройка Telegram Mini App

1. Откройте @BotFather в Telegram
2. Выберите ваш бот
3. Используйте команду `/setmenubutton`
4. Введите URL: `https://app.notfully.ru`
5. Введите название кнопки: "Open App"

Или используйте команду `/newapp`:
```
/newapp
[Выберите бот]
Title: Telegram Calls
Description: Video and audio calls in Telegram
Photo: [загрузите иконку 640x360]
Web App URL: https://app.notfully.ru
Short name: calls
```

## 10. Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f traefik
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker-compose -f docker-compose.prod.yml restart

# Перезапустить конкретный сервис
docker-compose -f docker-compose.prod.yml restart backend
```

### Обновление приложения

```bash
# Получить последние изменения
git pull origin master

# Пересобрать и перезапустить
docker-compose -f docker-compose.prod.yml up -d --build
```

## 11. Резервное копирование

### Backup базы данных

```bash
# Создать backup
docker exec telegram_calls_postgres pg_dump -U telegram_calls telegram_calls > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из backup
docker exec -i telegram_calls_postgres psql -U telegram_calls telegram_calls < backup_20240101_120000.sql
```

### Backup volumes

```bash
# Остановить сервисы
docker-compose -f docker-compose.prod.yml down

# Backup postgres data
sudo tar -czf postgres_backup.tar.gz /var/lib/docker/volumes/telegram-mini-app-calls_postgres_data

# Backup redis data
sudo tar -czf redis_backup.tar.gz /var/lib/docker/volumes/telegram-mini-app-calls_redis_data

# Запустить снова
docker-compose -f docker-compose.prod.yml up -d
```

## 12. Troubleshooting

### SSL сертификаты не генерируются

```bash
# Проверить логи Traefik
docker-compose -f docker-compose.prod.yml logs traefik | grep -i acme

# Проверить DNS записи
dig app.notfully.ru +short

# Убедиться что порты 80 и 443 открыты
sudo netstat -tulpn | grep -E ':(80|443)'

# Попробовать использовать staging server Let's Encrypt
# В traefik.toml раскомментируйте строку:
# caServer = "https://acme-staging-v02.api.letsencrypt.org/directory"
```

### Backend не может подключиться к базе данных

```bash
# Проверить что postgres запущен
docker-compose -f docker-compose.prod.yml ps postgres

# Проверить логи postgres
docker-compose -f docker-compose.prod.yml logs postgres

# Проверить подключение вручную
docker exec -it telegram_calls_backend bash
psql postgresql://telegram_calls:telegram_calls_pass@postgres:5432/telegram_calls
```

### WebSocket не работает

Убедитесь что в nginx.conf настроен WebSocket proxy:

```nginx
location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## 13. Безопасность

### Рекомендации

1. **Изменить все пароли по умолчанию** в `.env`
2. **Настроить fail2ban** для защиты от брутфорса SSH
3. **Регулярно обновлять** Docker образы и систему
4. **Настроить backup** базы данных
5. **Мониторить логи** на подозрительную активность

### Настройка fail2ban (опционально)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Готово!

Ваше приложение должно быть доступно по адресам:
- 🌐 Frontend: https://app.notfully.ru
- 🔧 Backend API: https://backend.notfully.ru
- 📊 Traefik Dashboard: https://traefik.notfully.ru (если настроен)
- 📖 API Docs: https://backend.notfully.ru/docs

Для тестирования откройте Telegram, найдите вашего бота и нажмите на кнопку меню!
