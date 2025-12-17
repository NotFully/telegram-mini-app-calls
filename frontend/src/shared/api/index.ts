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
  ICEServer,
} from '../types'

// Auth API
export const authApi = {
  telegramAuth: (data: TelegramAuthData) =>
    httpClient.post<AuthResponse>(API_ENDPOINTS.auth.telegram, data),
}

// Users API
export const usersApi = {
  getMe: () => httpClient.get<User>(API_ENDPOINTS.users.me),
  listUsers: async () => {
    const response = await httpClient.get<{ users: User[]; total: number }>(
      API_ENDPOINTS.users.list
    )
    return response.users
  },
  listOnlineUsers: async () => {
    const response = await httpClient.get<{ users: User[]; total: number }>(
      API_ENDPOINTS.users.online
    )
    return response.users
  },
}

// Rooms API
export const roomsApi = {
  createRoom: (creator_id: number) =>
    httpClient.post<Room>(API_ENDPOINTS.rooms.create, {
      creator_id,
    }),

  listRooms: async () => {
    const response = await httpClient.get<{ rooms: Room[]; total: number }>(
      API_ENDPOINTS.rooms.list
    )
    return response.rooms
  },

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

// Config API
export const configApi = {
  getConfig: async () => {
    const response = await httpClient.get<{ ice_servers: ICEServer[] }>(
      API_ENDPOINTS.config
    )
    return response.ice_servers
  },
}

export * from './http'
export * from './websocket'
