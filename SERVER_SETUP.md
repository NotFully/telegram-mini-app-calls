# Команды для запуска на сервере

## Один большой блок - копируйте и выполняйте

```bash
# 1. Клонирование и инициализация
cd ~
git clone https://github.com/NotFully/telegram-mini-app-calls.git
cd telegram-mini-app-calls
./deploy.sh init

# 2. Создать .env из шаблона
cp .env.prod .env

# 3. Генерация секретов и заполнение .env
echo "Generating secrets..."
SECRET_KEY=$(openssl rand -base64 32)
POSTGRES_PASS=$(openssl rand -base64 16)
TURN_PASS=$(openssl rand -base64 16)

# Получить публичный IP сервера
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "========================================="
echo "ВАШИ СГЕНЕРИРОВАННЫЕ ЗНАЧЕНИЯ:"
echo "========================================="
echo "SECRET_KEY=$SECRET_KEY"
echo "POSTGRES_PASSWORD=$POSTGRES_PASS"
echo "TURN_PASSWORD=$TURN_PASS"
echo "SERVER_IP=$SERVER_IP"
echo "========================================="
echo ""
echo "Сохраните эти значения! Сейчас откроется редактор .env"
echo "Нажмите Enter чтобы продолжить..."
read

# Открыть редактор
nano .env
```

## После редактирования .env:

В файле `.env` замените:

```env
SECRET_KEY=ВАШЕ_ЗНАЧЕНИЕ_SECRET_KEY
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
SERVER_IP=ВАШ_IP_СЕРВЕРА
POSTGRES_PASSWORD=ВАШЕ_ЗНАЧЕНИЕ_POSTGRES_PASS
TURN_PASSWORD=ВАШЕ_ЗНАЧЕНИЕ_TURN_PASS
VITE_TELEGRAM_BOT_NAME=username_вашего_бота
TRAEFIK_ADMIN_EMAIL=ваш_email@example.com
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

## Продолжение установки:

```bash
# 4. Обновить TURN конфигурацию
sed -i "s/listening-ip=127.0.0.1/listening-ip=0.0.0.0/" docker/coturn/turnserver.conf
sed -i "s/external-ip=localhost/external-ip=$(curl -s ifconfig.me)/" docker/coturn/turnserver.conf
sed -i "s/realm=localhost/realm=notfully.ru/" docker/coturn/turnserver.conf

# 5. Создать acme.json для SSL
touch docker/traefik/acme.json
chmod 600 docker/traefik/acme.json

# 6. Создать внешнюю сеть
docker network create web || true

# 7. Собрать и запустить
./deploy.sh build
./deploy.sh start

# 8. Посмотреть логи
./deploy.sh logs
```

## Проверка работы

```bash
# Проверить статус
./deploy.sh status

# Проверить что все контейнеры запущены
docker ps

# Проверить доступность (подождите 1-2 минуты для SSL)
curl -I https://app.notfully.ru
curl https://backend.notfully.ru/api/v1/health

# Если SSL еще не готов, проверьте логи Traefik
./deploy.sh logs traefik | grep -i acme
```

## Применить миграции базы данных

```bash
docker exec -it telegram_calls_backend bash

python3 << 'PYTHON_SCRIPT'
from src.infrastructure.database.base import engine, Base
import asyncio

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

asyncio.run(create_tables())
PYTHON_SCRIPT

exit
```

## Финальная проверка

```bash
# Проверить что все работает
echo "Frontend: https://app.notfully.ru"
echo "Backend API: https://backend.notfully.ru/docs"
echo "Backend Health: https://backend.notfully.ru/api/v1/health"

# Посмотреть логи для debugging
./deploy.sh logs
```

## Что делать если что-то не работает

### SSL сертификаты не выдаются

```bash
# Проверить DNS
dig app.notfully.ru +short
dig backend.notfully.ru +short

# Убедиться что домены указывают на ваш сервер IP
# Проверить логи Traefik
./deploy.sh logs traefik

# Проверить что порты открыты
sudo netstat -tulpn | grep -E ':(80|443)'

# Если нужно, открыть порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Backend не запускается

```bash
# Проверить логи
./deploy.sh logs backend

# Проверить подключение к базе
docker exec -it telegram_calls_backend bash
env | grep DATABASE_URL
exit
```

### Полный перезапуск

```bash
# Остановить всё
./deploy.sh stop

# Удалить контейнеры (данные в volumes сохранятся)
docker-compose -f docker-compose.prod.yml down

# Запустить снова
./deploy.sh start
```

### Удалить всё и начать с нуля

```bash
# ВНИМАНИЕ: Это удалит ВСЕ данные!
docker-compose -f docker-compose.prod.yml down -v
./deploy.sh build
./deploy.sh start
```

## Готово!

Ваше приложение должно работать на:
- 🌐 **Frontend**: https://app.notfully.ru
- 🔧 **Backend API**: https://backend.notfully.ru
- 📖 **API Docs**: https://backend.notfully.ru/docs
- 📊 **Traefik**: https://traefik.notfully.ru

Не забудьте настроить Mini App в @BotFather!
