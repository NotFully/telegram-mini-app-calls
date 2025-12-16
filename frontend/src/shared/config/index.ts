/**
 * Application configuration
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  telegramBotName: import.meta.env.VITE_TELEGRAM_BOT_NAME || '',
  apiV1Prefix: '/api/v1',
} as const

export const API_ENDPOINTS = {
  auth: {
    telegram: `${config.apiV1Prefix}/auth/telegram`,
  },
  users: {
    me: `${config.apiV1Prefix}/users/me`,
    list: `${config.apiV1Prefix}/users`,
    online: `${config.apiV1Prefix}/users/online`,
  },
  rooms: {
    create: `${config.apiV1Prefix}/rooms`,
    list: `${config.apiV1Prefix}/rooms`,
    get: (id: string) => `${config.apiV1Prefix}/rooms/${id}`,
    join: (id: string) => `${config.apiV1Prefix}/rooms/${id}/join`,
    leave: (id: string) => `${config.apiV1Prefix}/rooms/${id}/leave`,
  },
  websocket: `${config.wsUrl}/ws`,
} as const
