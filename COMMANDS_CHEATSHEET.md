# Шпаргалка по командам

## Production Deployment - Основные команды

### Первоначальная настройка (один раз)

```bash
# На сервере
cd ~
git clone https://github.com/NotFully/telegram-mini-app-calls.git
cd telegram-mini-app-calls

# Инициализация
./deploy.sh init

# Настроить .env (ОБЯЗАТЕЛЬНО!)
nano .env

# Обновить TURN config
nano docker/coturn/turnserver.conf
# Изменить: external-ip=YOUR_SERVER_IP, realm=notfully.ru

# Собрать и запустить
./deploy.sh build
./deploy.sh start
```

### Ежедневные команды

```bash
# Статус сервисов
./deploy.sh status

# Просмотр логов
./deploy.sh logs              # Все сервисы
./deploy.sh logs backend      # Только backend
./deploy.sh logs traefik      # Только traefik

# Перезапуск
./deploy.sh restart

# Backup базы данных
./deploy.sh backup

# Обновление (git pull + rebuild)
./deploy.sh update

# Остановка/запуск
./deploy.sh stop
./deploy.sh start
```

### Проверка работы

```bash
# Статус контейнеров
docker ps

# Frontend
curl -I https://app.notfully.ru

# Backend API
curl https://backend.notfully.ru/api/v1/health

# API Documentation
open https://backend.notfully.ru/docs

# Проверить SSL сертификаты
cat docker/traefik/acme.json | jq '.Certificates[] | .Domain.Main'
```

### Debugging

```bash
# Логи конкретного сервиса
./deploy.sh logs backend | tail -100
./deploy.sh logs traefik | grep -i error

# Войти в контейнер
docker exec -it telegram_calls_backend bash
docker exec -it telegram_calls_frontend sh
docker exec -it telegram_calls_postgres bash

# Проверить переменные окружения
docker exec telegram_calls_backend env

# Проверить подключение к базе
docker exec -it telegram_calls_backend bash
python3 -c "
from src.infrastructure.database.base import engine
import asyncio
async def test():
    async with engine.connect() as conn:
        print('Database connection OK')
asyncio.run(test())
"
```

### Применение миграций

```bash
docker exec -it telegram_calls_backend bash

python3 << 'EOF'
from src.infrastructure.database.base import engine, Base
import asyncio

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created!")

asyncio.run(create_tables())
EOF

exit
```

### Backup и Restore

```bash
# Backup
./deploy.sh backup

# Manual backup
docker exec telegram_calls_postgres pg_dump -U telegram_calls telegram_calls > backup.sql

# Restore
docker exec -i telegram_calls_postgres psql -U telegram_calls telegram_calls < backup.sql

# Backup volumes
docker-compose -f docker-compose.prod.yml down
sudo tar -czf postgres_backup.tar.gz /var/lib/docker/volumes/telegram-mini-app-calls_postgres_data
docker-compose -f docker-compose.prod.yml up -d
```

### Очистка и перезапуск

```bash
# Перезапуск всего
./deploy.sh restart

# Остановить и удалить контейнеры (данные сохраняются)
docker-compose -f docker-compose.prod.yml down
./deploy.sh start

# Пересобрать образы
./deploy.sh build
./deploy.sh start

# Полная очистка (УДАЛИТ ВСЕ ДАННЫЕ!)
docker-compose -f docker-compose.prod.yml down -v
./deploy.sh build
./deploy.sh start
```

## DNS настройки

Добавить A-записи в DNS:

```
app.notfully.ru     A    YOUR_SERVER_IP
backend.notfully.ru A    YOUR_SERVER_IP
traefik.notfully.ru A    YOUR_SERVER_IP
```

Проверка DNS:

```bash
dig app.notfully.ru +short
dig backend.notfully.ru +short
nslookup app.notfully.ru
```

## Firewall

### UFW (Ubuntu/Debian)

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3478/tcp   # TURN TCP
sudo ufw allow 3478/udp   # TURN UDP
sudo ufw enable
sudo ufw status
```

### iptables

```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3478 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 3478 -j ACCEPT
sudo iptables-save
```

## Telegram Bot настройка

```
1. Открыть @BotFather
2. /newapp
3. Выбрать бот
4. Title: Telegram Calls
5. Description: Video and audio calls
6. Web App URL: https://app.notfully.ru
7. Short name: calls
```

Или установить menu button:

```
/setmenubutton
[Выбрать бот]
URL: https://app.notfully.ru
Button text: Open App
```

## Troubleshooting

### SSL не работает

```bash
# Проверить логи
./deploy.sh logs traefik | grep -i acme

# Проверить DNS
dig app.notfully.ru +short

# Проверить порты
sudo netstat -tulpn | grep -E ':(80|443)'

# Удалить старые сертификаты и попробовать снова
rm docker/traefik/acme.json
touch docker/traefik/acme.json
chmod 600 docker/traefik/acme.json
./deploy.sh restart
```

### Backend не запускается

```bash
./deploy.sh logs backend
docker exec -it telegram_calls_backend bash
env | grep DATABASE_URL
python3 -m pip list
```

### WebSocket не работает

```bash
# Проверить WebSocket endpoint
wscat -c wss://backend.notfully.ru/ws

# Проверить nginx config
cat docker/nginx/nginx.conf | grep -A5 "location /ws"

# Проверить Traefik labels
docker inspect telegram_calls_backend | grep -i websocket
```

### База данных

```bash
# Подключиться к PostgreSQL
docker exec -it telegram_calls_postgres psql -U telegram_calls telegram_calls

# Команды в psql:
\dt                    # Список таблиц
\d+ users              # Описание таблицы users
SELECT * FROM users;   # Запрос
\q                     # Выход
```

## Полезные ссылки

- [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md) - Краткая инструкция
- [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md) - Полная инструкция
- [SERVER_SETUP.md](SERVER_SETUP.md) - Команды для copy-paste
- [LOCAL_TESTING.md](LOCAL_TESTING.md) - Локальное тестирование
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Настройка Telegram Mini App

## Мониторинг

```bash
# CPU и Memory использование
docker stats

# Размер volumes
docker system df -v

# Очистка неиспользуемых образов
docker image prune -a

# Просмотр сетей
docker network ls
docker network inspect web
```

## Production URLs

- 🌐 Frontend: https://app.notfully.ru
- 🔧 Backend: https://backend.notfully.ru
- 📖 API Docs: https://backend.notfully.ru/docs
- 📊 Traefik: https://traefik.notfully.ru
