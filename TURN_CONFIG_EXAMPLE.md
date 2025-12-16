# Настройка TURN сервера - Пример

## Что нужно изменить в файле `docker/coturn/turnserver.conf`

### ❌ БЫЛО (по умолчанию):

```conf
# External IP (set this to your server's public IP)
# Пример: если IP сервера 123.45.67.89, раскомментируйте и укажите:
# external-ip=123.45.67.89
external-ip=YOUR_PUBLIC_IP

# Realm for TURN server (домен вашего проекта)
realm=notfully.ru
```

### ✅ ДОЛЖНО БЫТЬ (после настройки):

Если публичный IP вашего сервера например **95.163.240.123**, то:

```conf
# External IP (set this to your server's public IP)
# Пример: если IP сервера 123.45.67.89, раскомментируйте и укажите:
# external-ip=123.45.67.89
external-ip=95.163.240.123

# Realm for TURN server (домен вашего проекта)
realm=notfully.ru
```

## Как узнать публичный IP сервера

```bash
# На сервере выполните:
curl ifconfig.me

# Или
curl icanhazip.com

# Или
curl ipinfo.io/ip
```

## Способы настройки

### Способ 1: Автоматический (рекомендуется)

На сервере выполните:

```bash
# Получить IP и автоматически обновить конфиг
SERVER_IP=$(curl -s ifconfig.me)
sed -i "s/external-ip=YOUR_PUBLIC_IP/external-ip=$SERVER_IP/" docker/coturn/turnserver.conf

# Проверить результат
grep "external-ip=" docker/coturn/turnserver.conf
```

### Способ 2: Вручную через редактор

```bash
# Открыть файл в редакторе
nano docker/coturn/turnserver.conf

# Найти строку:
external-ip=YOUR_PUBLIC_IP

# Заменить на (например):
external-ip=95.163.240.123

# Сохранить: Ctrl+O, Enter, Ctrl+X
```

## Полный пример конфига после настройки

Допустим ваш сервер имеет IP **95.163.240.123**, тогда важные строки будут такими:

```conf
# TURN server configuration

# Listening port for TURN/STUN
listening-port=3478

# TLS listening port
tls-listening-port=5349

# Listening IP (0.0.0.0 for all interfaces)
listening-ip=0.0.0.0

# External IP - ВАШ ПУБЛИЧНЫЙ IP!
external-ip=95.163.240.123

# Relay IP (usually same as listening IP)
relay-ip=0.0.0.0

# Realm for TURN server - ВАШ ДОМЕН!
realm=notfully.ru

# Server name
server-name=telegram-calls-turn

# Use long-term credential mechanism
lt-cred-mech

# Static user credentials (username:password)
user=telegram_calls:telegram_calls_turn

# Остальные настройки оставляем как есть...
```

## Проверка после настройки

```bash
# Проверить что IP указан правильно
cat docker/coturn/turnserver.conf | grep "external-ip="

# Должно показать (с вашим IP):
# external-ip=95.163.240.123

# Проверить realm
cat docker/coturn/turnserver.conf | grep "realm="

# Должно показать:
# realm=notfully.ru
```

## Что такое external-ip?

`external-ip` - это **публичный IP адрес вашего сервера**, который виден из интернета.

- **НЕ НУЖНО** указывать `127.0.0.1` или `localhost` - это не сработает!
- **НУЖНО** указать реальный публичный IP сервера, например `95.163.240.123`

TURN сервер использует этот IP чтобы клиенты могли подключиться к нему через NAT/firewall.

## Что такое realm?

`realm` - это домен вашего проекта. В нашем случае это `notfully.ru`.

Это значение используется для аутентификации в TURN сервере.

## После изменения конфига

После того как вы изменили `external-ip`, нужно перезапустить сервисы:

```bash
# Если уже запущены
docker-compose -f docker-compose.prod.yml restart coturn

# Или при первом запуске просто продолжайте установку
./deploy.sh start
```

## Готово!

Теперь TURN сервер настроен правильно и клиенты смогут устанавливать WebRTC соединения даже через NAT.
