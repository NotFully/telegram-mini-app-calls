/**
 * API functions for interacting with the backend
 */

import { httpClient } from './http'
import { API_ENDPOINTS } from '../config'
import type {
  TelegramAuthData,
  AuthResponse,
  User,
  Room,
  ApiResponse,
} from '../types'

// Auth API
export const authApi = {
  telegramAuth: (data: TelegramAuthData) =>
    httpClient.post<AuthResponse>(API_ENDPOINTS.auth.telegram, data),
}

// Users API
export const usersApi = {
  getMe: () => httpClient.get<User>(API_ENDPOINTS.users.me),
  listUsers: () => httpClient.get<User[]>(API_ENDPOINTS.users.list),
  listOnlineUsers: () => httpClient.get<User[]>(API_ENDPOINTS.users.online),
}

// Rooms API
export const roomsApi = {
  createRoom: (creator_id: number) =>
    httpClient.post<{ room_id: string }>(API_ENDPOINTS.rooms.create, {
      creator_id,
    }),

  listRooms: () => httpClient.get<Room[]>(API_ENDPOINTS.rooms.list),

  getRoom: (roomId: string) =>
    httpClient.get<Room>(API_ENDPOINTS.rooms.get(roomId)),

  joinRoom: (roomId: string, userId: number) =>
    httpClient.post<ApiResponse<Room>>(API_ENDPOINTS.rooms.join(roomId), {
      user_id: userId,
    }),

  leaveRoom: (roomId: string, userId: number) =>
    httpClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.rooms.leave(roomId),
      { user_id: userId }
    ),
}

export * from './http'
export * from './websocket'
