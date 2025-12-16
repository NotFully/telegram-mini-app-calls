# 📱 Настройка Telegram Mini App

## Пошаговая инструкция подключения к Telegram

### Шаг 1: Создание Telegram Bot

1. **Откройте [@BotFather](https://t.me/BotFather)** в Telegram

2. **Создайте нового бота**:
   ```
   /newbot
   ```

3. **Введите имя бота** (например: `My Calls Bot`)

4. **Введите username бота** (должен заканчиваться на `bot`, например: `mycalls_bot`)

5. **Скопируйте токен бота** (выглядит примерно так):
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

6. **Добавьте токен в `.env` файл**:
   ```bash
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Шаг 2: Создание Web App (Mini App)

1. **В [@BotFather](https://t.me/BotFather) введите**:
   ```
   /newapp
   ```

2. **Выберите вашего бота** из списка

3. **Введите название приложения** (например: `Calls`):
   ```
   Calls
   ```

4. **Введите описание** (например):
   ```
   Video and audio calls via WebRTC
   ```

5. **Загрузите фото/иконку** (512x512 px, PNG/JPG)
   - Можете пропустить, нажав `/empty`

6. **Загрузите GIF-демо** (опционально)
   - Можете пропустить, нажав `/empty`

7. **⚠️ ВАЖНО! Введите URL вашего приложения**:

   **Для локальной разработки** (с ngrok):
   ```
   https://your-ngrok-url.ngrok-free.app
   ```

   **Для продакшена** (с вашим доменом):
   ```
   https://your-domain.com
   ```

8. **Введите короткое название** (будет отображаться в меню):
   ```
   Calls
   ```

9. **BotFather пришлёт подтверждение** с ссылкой на Mini App! ✅

### Шаг 3: Локальная разработка с ngrok

Для локальной разработки нужно сделать ваше приложение доступным из интернета:

#### 3.1. Установка ngrok

**macOS**:
```bash
brew install ngrok
```

**Linux**:
```bash
# Скачать с https://ngrok.com/download
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

**Windows**:
- Скачайте с https://ngrok.com/download

#### 3.2. Регистрация в ngrok

1. Зарегистрируйтесь на https://dashboard.ngrok.com/signup
2. Получите auth token на https://dashboard.ngrok.com/get-started/your-authtoken
3. Настройте ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

#### 3.3. Запуск ngrok

**Откройте новый терминал** и запустите:
```bash
ngrok http 80
```

Вы увидите примерно так:
```
Session Status                online
Account                       your@email.com
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:80
```

**Скопируйте URL** (например: `https://abc123.ngrok-free.app`)

#### 3.4. Обновите URL Mini App

В [@BotFather](https://t.me/BotFather):
```
/myapps
# Выберите ваше приложение
# Нажмите "Edit Web App URL"
# Введите ngrok URL: https://abc123.ngrok-free.app
```

### Шаг 4: Обновление переменных окружения

Обновите `.env` файл:

```bash
# Backend
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Frontend (для ngrok)
VITE_API_URL=https://abc123.ngrok-free.app
VITE_WS_URL=wss://abc123.ngrok-free.app
VITE_TELEGRAM_BOT_NAME=mycalls_bot
```

**Перезапустите сервисы**:
```bash
make restart
```

### Шаг 5: Тестирование Mini App

1. **Откройте вашего бота в Telegram**

2. **Нажмите на кнопку меню** (≡) внизу

3. **Выберите ваше Mini App** из списка

4. **Приложение должно открыться!** 🎉

### Шаг 6: Настройка кнопки запуска

Чтобы добавить кнопку для быстрого запуска Mini App:

В [@BotFather](https://t.me/BotFather):
```
/mybots
# Выберите вашего бота
# Bot Settings
# Menu Button
# Edit Menu Button URL
# Введите URL: https://abc123.ngrok-free.app
```

Теперь при открытии бота будет кнопка "Открыть приложение"!

## 🔐 Безопасность для продакшена

### SSL сертификат (обязательно!)

Telegram требует HTTPS для Mini Apps. Для продакшена:

#### Вариант 1: Let's Encrypt (рекомендуется)

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d your-domain.com
```

#### Вариант 2: Cloudflare (простой способ)

1. Добавьте домен в Cloudflare
2. Включите "Proxy" для домена
3. SSL будет работать автоматически

### Обновление nginx для продакшена

Создайте `docker/nginx/nginx-prod.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🧪 Отладка

### Проверка Telegram WebApp API

Добавьте в начало вашего приложения (для отладки):

```javascript
// frontend/src/app/providers/TelegramProvider.tsx
useEffect(() => {
  console.log('Telegram WebApp available:', !!window.Telegram?.WebApp)
  console.log('User data:', window.Telegram?.WebApp?.initDataUnsafe?.user)
  console.log('Platform:', window.Telegram?.WebApp?.platform)
}, [])
```

### Проверка через консоль браузера

В Mini App откройте DevTools (если возможно):
- Desktop: `Ctrl+Shift+I` или `Cmd+Option+I`
- Telegram Desktop: Включите "Debug mode" → Tools → Show Web Inspector

### Логи backend

```bash
# Смотреть логи в реальном времени
make logs-backend

# Проверить подключения WebSocket
docker-compose exec backend grep -i "websocket" /app/logs/*.log
```

## 📊 Чеклист запуска

- [ ] Создан бот через @BotFather
- [ ] Получен и добавлен TELEGRAM_BOT_TOKEN в .env
- [ ] Создан Web App через /newapp
- [ ] Установлен и настроен ngrok (для локальной разработки)
- [ ] Запущен ngrok http 80
- [ ] Обновлён URL Mini App в @BotFather
- [ ] Обновлены VITE_API_URL и VITE_WS_URL в .env
- [ ] Перезапущены сервисы (make restart)
- [ ] Mini App открывается из Telegram
- [ ] Telegram WebApp API доступен
- [ ] Пользователь авторизуется автоматически

## 🆘 Частые проблемы

### Mini App не открывается

1. **Проверьте URL**:
   ```bash
   curl https://your-ngrok-url.ngrok-free.app
   ```

2. **Проверьте что frontend работает**:
   ```bash
   docker-compose ps frontend
   ```

3. **Проверьте ngrok**:
   - Убедитесь что ngrok запущен
   - URL должен быть HTTPS
   - ngrok бесплатный аккаунт имеет ограничения

### "This site can't provide a secure connection"

- Используйте ngrok для локальной разработки
- Для продакшена нужен SSL сертификат

### Telegram WebApp API не доступен

- Убедитесь что открываете через Telegram
- Проверьте что скрипт загружен:
  ```html
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  ```

### WebSocket не подключается

1. **Проверьте что backend запущен**:
   ```bash
   curl http://localhost:8000
   ```

2. **Проверьте CORS в backend**:
   ```python
   # backend/src/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # В продакшене укажите конкретные домены
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 🚀 Готово!

Теперь ваше Telegram Mini App должно работать!

Откройте бота в Telegram и запустите приложение через кнопку меню.

---

**Нужна помощь?**
- Telegram Mini Apps Docs: https://core.telegram.org/bots/webapps
- ngrok Docs: https://ngrok.com/docs
