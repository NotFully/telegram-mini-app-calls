# Настройка xray для работы с Traefik

## Проблема
Xray занимает порт 443, а Traefik тоже нужен порт 443 для SSL сертификатов.

## Решение
Настроить xray для SNI routing - он будет пробрасывать трафик для доменов `*.notfully.ru` в Traefik.

## Конфигурация xray

Найдите конфигурационный файл xray (обычно `/etc/xray/config.json` или `/usr/local/etc/xray/config.json`):

```bash
# Найти конфиг
find / -name "config.json" 2>/dev/null | grep xray
```

### Добавить fallbacks в конфиг xray

В секцию `inbounds` добавьте `fallbacks`:

```json
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          // ваши клиенты
        ],
        "decryption": "none",
        "fallbacks": [
          {
            "dest": "127.0.0.1:8443",
            "xver": 1,
            "name": "app.notfully.ru"
          },
          {
            "dest": "127.0.0.1:8443",
            "xver": 1,
            "name": "backend.notfully.ru"
          },
          {
            "dest": "127.0.0.1:8443",
            "xver": 1,
            "name": "traefik.notfully.ru"
          },
          {
            "dest": "127.0.0.1:8080",
            "xver": 1,
            "path": "/.well-known/acme-challenge"
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "alpn": ["http/1.1", "h2"],
          "certificates": [
            {
              "certificateFile": "/path/to/fullchain.pem",
              "keyFile": "/path/to/privkey.pem"
            }
          ]
        }
      }
    }
  ]
}
```

### Объяснение конфигурации

- **fallbacks** - правила проброса трафика
- `name: "app.notfully.ru"` - если SNI (доменное имя) = app.notfully.ru, пробросить на 127.0.0.1:8443 (Traefik)
- `path: "/.well-known/acme-challenge"` - путь для Let's Encrypt ACME challenge, пробросить на HTTP порт 8080

## Альтернативное решение (проще)

Если не хотите возиться с xray конфигом, используйте **Nginx** как фронтальный прокси:

### 1. Остановить xray с порта 443

```bash
# Изменить порт xray на другой (например 8443)
# Отредактировать /etc/xray/config.json
# Изменить "port": 443 на "port": 8443

systemctl restart xray
```

### 2. Установить и настроить Nginx

```bash
sudo apt install nginx -y
```

Создать конфиг `/etc/nginx/sites-available/xray-traefik`:

```nginx
# Проброс для Traefik (домены notfully.ru)
server {
    listen 443 ssl http2;
    server_name app.notfully.ru backend.notfully.ru traefik.notfully.ru;

    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/notfully.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/notfully.ru/privkey.pem;

    location / {
        proxy_pass https://127.0.0.1:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Проброс для xray (другие домены)
stream {
    map $ssl_preread_server_name $backend {
        default 127.0.0.1:8443;  # xray на порту 8443
    }

    server {
        listen 443;
        proxy_pass $backend;
        ssl_preread on;
    }
}

# HTTP редирект
server {
    listen 80;
    server_name *.notfully.ru;

    location /.well-known/acme-challenge/ {
        proxy_pass http://127.0.0.1:8080;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

## Рекомендация

**Самый простой вариант:**

1. Изменить порт xray на **8443**
2. Вернуть Traefik на порты **80/443**
3. Клиенты xray подключаются на порт **8443**
4. Traefik работает на **80/443** для веб-приложения

### Как изменить порт xray:

```bash
# 1. Найти конфиг xray
nano /etc/xray/config.json

# 2. Изменить порт
# Было:
#   "port": 443
# Стало:
#   "port": 8443

# 3. Перезапустить xray
systemctl restart xray

# 4. Вернуть Traefik на порты 80/443
# В docker-compose.prod.yml:
#   - "80:80"
#   - "443:443"

# 5. Перезапустить docker-compose
cd ~/telegram-mini-app-calls
docker-compose -f docker-compose.prod.yml down
./deploy.sh start
```

## Проверка

После настройки проверьте:

```bash
# Traefik должен слушать на 8443
sudo netstat -tulpn | grep :8443

# xray должен слушать на 443 (или на новом порту)
sudo netstat -tulpn | grep :443

# Проверить доступность
curl -I https://app.notfully.ru
curl -I https://backend.notfully.ru
```

## Что выбрать?

**Если xray КРИТИЧЕН для работы VPN:**
- Вариант 1: SNI routing в xray (сложнее)
- Вариант 2: Nginx как фронтальный прокси (средняя сложность)

**Если можно изменить порт xray:**
- Вариант 3: Изменить порт xray на 8443 (ПРОЩЕ ВСЕГО) ⭐

Рекомендую **Вариант 3** - самый простой и надежный!
