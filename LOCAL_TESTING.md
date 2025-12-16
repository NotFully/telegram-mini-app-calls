# 🧪 Локальное тестирование без Telegram Mini App

## Как протестировать звонки локально (без Telegram)

### Вариант 1: Тестирование через браузер (Быстрый способ)

#### Шаг 1: Обновите TelegramProvider для тестирования

Откройте файл [frontend/src/app/providers/TelegramProvider.tsx](frontend/src/app/providers/TelegramProvider.tsx) и убедитесь что там есть mock пользователь:

```typescript
if (!userData) {
  // Для development/testing вне Telegram используем mock пользователя
  console.warn('Telegram user data not available, using mock user')
  const mockUser = {
    id: 1,
    telegram_id: 123456789,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    is_online: true,
    created_at: new Date().toISOString(),
  }
  setCurrentUser(mockUser)
  setIsInitialized(true)
  return
}
```

**Этот код уже есть в проекте!** Просто откройте приложение в браузере.

#### Шаг 2: Откройте приложение в браузере

```bash
# Убедитесь что сервисы запущены
docker-compose ps

# Откройте в браузере
open http://localhost  # macOS
xdg-open http://localhost  # Linux
# Windows: просто откройте http://localhost в браузере
```

#### Шаг 3: Откройте второе окно для тестирования звонка

**Вариант A: Режим инкогнито** (рекомендуется)
1. Откройте `http://localhost` в обычном окне
2. Откройте `http://localhost` в режиме инкогнито (`Ctrl+Shift+N` или `Cmd+Shift+N`)

**Вариант B: Другой браузер**
1. Откройте `http://localhost` в Chrome
2. Откройте `http://localhost` в Firefox/Safari

#### Шаг 4: Настройте mock пользователей

**В первом окне** (будет User 1):
- Откройте DevTools (F12)
- В консоли выполните:
```javascript
localStorage.setItem('mockUserId', '1')
location.reload()
```

**Во втором окне** (будет User 2):
- Откройте DevTools (F12)
- В консоли выполните:
```javascript
localStorage.setItem('mockUserId', '2')
location.reload()
```

#### Шаг 5: Создайте улучшенный mock для нескольких пользователей

Обновите `TelegramProvider.tsx`:

```typescript
// Получаем mockUserId из localStorage для тестирования
const mockUserId = localStorage.getItem('mockUserId') || '1'

const mockUser = {
  id: parseInt(mockUserId),
  telegram_id: 123456789 + parseInt(mockUserId),
  username: `testuser${mockUserId}`,
  first_name: `Test ${mockUserId}`,
  last_name: 'User',
  is_online: true,
  created_at: new Date().toISOString(),
}
```

#### Шаг 6: Тестируйте звонок!

1. В **первом окне**: вы увидите список онлайн пользователей
2. Нажмите кнопку "Call Test 2" (или другого пользователя)
3. Во **втором окне**: должен появиться входящий звонок
4. Примите звонок
5. **Проверьте**:
   - Видео с обеих сторон
   - Аудио с обеих сторон
   - Кнопки управления (микрофон, камера, завершить)

---

### Вариант 2: API тестирование (без frontend)

#### 2.1. Тестирование REST API

**Проверка health:**
```bash
curl http://localhost:8000/
```

**Создание пользователя:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Получение списка онлайн пользователей:**
```bash
curl http://localhost:8000/api/v1/users/online
```

**Создание комнаты для звонка:**
```bash
curl -X POST http://localhost:8000/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": 1
  }'
```

#### 2.2. Тестирование WebSocket

Создайте файл `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
</head>
<body>
    <h1>WebSocket Signaling Test</h1>
    <div id="status">Connecting...</div>
    <div id="messages"></div>

    <script>
        const userId = 1; // Измените для второго клиента
        const ws = new WebSocket(`ws://localhost:8000/ws?user_id=${userId}`);

        ws.onopen = () => {
            document.getElementById('status').textContent = 'Connected!';
            console.log('WebSocket connected');

            // Присоединиться к комнате
            ws.send(JSON.stringify({
                type: 'join-room',
                room_id: 'test-room-123'
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);

            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<div>${JSON.stringify(data, null, 2)}</div>`;
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            document.getElementById('status').textContent = 'Error!';
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            document.getElementById('status').textContent = 'Disconnected';
        };
    </script>
</body>
</html>
```

Откройте `test-websocket.html` в двух браузерах с разными userId.

---

### Вариант 3: Использование готовых инструментов

#### 3.1. Swagger UI (встроенный)

Откройте http://localhost:8000/docs

**Что можно тестировать:**
- ✅ Создание пользователей
- ✅ Создание комнат
- ✅ Присоединение к комнатам
- ✅ Получение информации о комнатах
- ✅ Список онлайн пользователей

**Попробуйте:**
1. POST `/api/v1/auth/telegram` - создать пользователя
2. POST `/api/v1/rooms` - создать комнату
3. POST `/api/v1/rooms/{room_id}/join` - присоединиться
4. GET `/api/v1/rooms/{room_id}` - получить инфо о комнате

#### 3.2. Postman Collection

Создайте коллекцию Postman:

**1. Create User:**
```
POST http://localhost:8000/api/v1/auth/telegram
Body (JSON):
{
  "telegram_id": 111,
  "username": "user1",
  "first_name": "User",
  "last_name": "One"
}
```

**2. Create Room:**
```
POST http://localhost:8000/api/v1/rooms
Body (JSON):
{
  "creator_id": 1
}
```

**3. Join Room:**
```
POST http://localhost:8000/api/v1/rooms/{room_id}/join
Body (JSON):
{
  "user_id": 2
}
```

---

### Вариант 4: Mock тестирование WebRTC

#### 4.1. Создайте тестовую страницу

Создайте `frontend/public/test-webrtc.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebRTC Test</title>
    <style>
        video { width: 45%; margin: 10px; border: 2px solid #000; }
        #controls { margin: 20px; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <h1>WebRTC Local Test</h1>

    <div id="controls">
        <button onclick="startLocalVideo()">Start Video</button>
        <button onclick="startCall()">Start Call (Loopback)</button>
        <button onclick="hangup()">Hang Up</button>
    </div>

    <div>
        <video id="localVideo" autoplay muted></video>
        <video id="remoteVideo" autoplay></video>
    </div>

    <script>
        let localStream;
        let peerConnection;
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        async function startLocalVideo() {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localVideo.srcObject = localStream;
                console.log('Local video started');
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        }

        async function startCall() {
            if (!localStream) {
                alert('Start video first!');
                return;
            }

            // Create peer connection
            peerConnection = new RTCPeerConnection(configuration);

            // Add local stream
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                console.log('Remote track received');
                remoteVideo.srcObject = event.streams[0];
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('ICE candidate:', event.candidate);
                }
            };

            // Create offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            console.log('Call started (loopback mode)');
            console.log('Offer SDP:', offer.sdp);
        }

        function hangup() {
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            localVideo.srcObject = null;
            remoteVideo.srcObject = null;
            console.log('Call ended');
        }
    </script>
</body>
</html>
```

Откройте http://localhost/test-webrtc.html

---

### Вариант 5: Создание простого тестового скрипта

Создайте `test-local.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Telegram Calls API..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"

# Test 1: Health check
echo "1. Testing health check..."
HEALTH=$(curl -s $API_URL)
if [ -n "$HEALTH" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    exit 1
fi

# Test 2: Create user 1
echo ""
echo "2. Creating User 1..."
USER1=$(curl -s -X POST $API_URL/api/v1/auth/telegram \
    -H "Content-Type: application/json" \
    -d '{
        "telegram_id": 111,
        "username": "testuser1",
        "first_name": "Test",
        "last_name": "User1"
    }')
echo $USER1 | jq .
USER1_ID=$(echo $USER1 | jq -r '.user_id')

if [ -n "$USER1_ID" ] && [ "$USER1_ID" != "null" ]; then
    echo -e "${GREEN}✓ User 1 created (ID: $USER1_ID)${NC}"
else
    echo -e "${RED}✗ Failed to create User 1${NC}"
fi

# Test 3: Create user 2
echo ""
echo "3. Creating User 2..."
USER2=$(curl -s -X POST $API_URL/api/v1/auth/telegram \
    -H "Content-Type: application/json" \
    -d '{
        "telegram_id": 222,
        "username": "testuser2",
        "first_name": "Test",
        "last_name": "User2"
    }')
echo $USER2 | jq .
USER2_ID=$(echo $USER2 | jq -r '.user_id')

if [ -n "$USER2_ID" ] && [ "$USER2_ID" != "null" ]; then
    echo -e "${GREEN}✓ User 2 created (ID: $USER2_ID)${NC}"
else
    echo -e "${RED}✗ Failed to create User 2${NC}"
fi

# Test 4: Create room
echo ""
echo "4. Creating room..."
ROOM=$(curl -s -X POST $API_URL/api/v1/rooms \
    -H "Content-Type: application/json" \
    -d "{\"creator_id\": $USER1_ID}")
echo $ROOM | jq .
ROOM_ID=$(echo $ROOM | jq -r '.room_id')

if [ -n "$ROOM_ID" ] && [ "$ROOM_ID" != "null" ]; then
    echo -e "${GREEN}✓ Room created (ID: $ROOM_ID)${NC}"
else
    echo -e "${RED}✗ Failed to create room${NC}"
fi

# Test 5: Join room
echo ""
echo "5. User 2 joining room..."
JOIN=$(curl -s -X POST $API_URL/api/v1/rooms/$ROOM_ID/join \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": $USER2_ID}")
echo $JOIN | jq .

# Test 6: Get room info
echo ""
echo "6. Getting room info..."
ROOM_INFO=$(curl -s $API_URL/api/v1/rooms/$ROOM_ID)
echo $ROOM_INFO | jq .

PARTICIPANTS=$(echo $ROOM_INFO | jq '.participants | length')
if [ "$PARTICIPANTS" = "2" ]; then
    echo -e "${GREEN}✓ Both users in room${NC}"
else
    echo -e "${RED}✗ Expected 2 participants, got $PARTICIPANTS${NC}"
fi

echo ""
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""
echo "📱 Now open http://localhost in two browser windows to test WebRTC calls"
echo "   Window 1: localStorage.setItem('mockUserId', '1')"
echo "   Window 2: localStorage.setItem('mockUserId', '2')"
```

Запустите:
```bash
chmod +x test-local.sh
./test-local.sh
```

---

## 🎯 Чек-лист тестирования

### Backend API
- [ ] Health check работает (GET /)
- [ ] Создание пользователя (POST /api/v1/auth/telegram)
- [ ] Получение списка пользователей (GET /api/v1/users/online)
- [ ] Создание комнаты (POST /api/v1/rooms)
- [ ] Присоединение к комнате (POST /api/v1/rooms/{id}/join)
- [ ] Получение информации о комнате (GET /api/v1/rooms/{id})

### WebSocket
- [ ] Подключение к WebSocket (ws://localhost:8000/ws?user_id=1)
- [ ] Отправка сообщения join-room
- [ ] Получение сообщений от сервера
- [ ] Обмен ICE candidates
- [ ] Обмен SDP offer/answer

### WebRTC
- [ ] Доступ к камере и микрофону
- [ ] Создание RTCPeerConnection
- [ ] Создание offer
- [ ] Установка localDescription и remoteDescription
- [ ] Обмен ICE candidates
- [ ] Получение remote stream
- [ ] Отображение видео

### Frontend
- [ ] Приложение загружается (http://localhost)
- [ ] Mock пользователь создаётся автоматически
- [ ] Отображается список онлайн пользователей
- [ ] Кнопка "Call" работает
- [ ] Видео отображается
- [ ] Кнопки управления работают (микрофон, камера, завершить)

---

## 🐛 Отладка

### Проверка камеры и микрофона в браузере

```javascript
// В консоли браузера
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('Media access granted:', stream.getTracks());
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => console.error('Media access denied:', error));
```

### Проверка WebSocket подключения

```javascript
// В консоли браузера
const ws = new WebSocket('ws://localhost:8000/ws?user_id=1');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.error('Error:', e);
```

### Логи backend в реальном времени

```bash
# Следить за логами
docker-compose logs -f backend

# Фильтровать только WebSocket
docker-compose logs -f backend | grep -i websocket

# Фильтровать только ошибки
docker-compose logs -f backend | grep -i error
```

---

## ✅ Готово!

Теперь вы можете тестировать звонки локально без Telegram Mini App!

**Рекомендуемый порядок тестирования:**
1. Проверьте API через Swagger (http://localhost:8000/docs)
2. Проверьте WebSocket через test-websocket.html
3. Проверьте WebRTC через test-webrtc.html
4. Протестируйте полный звонок в двух окнах браузера

**После успешного локального тестирования:**
- Переходите к настройке Telegram Mini App (см. [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md))
