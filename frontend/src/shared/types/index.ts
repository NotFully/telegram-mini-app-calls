/**
 * Shared TypeScript types and interfaces
 */

// User types
export interface User {
  id: number
  telegram_id: number
  username?: string
  first_name: string
  last_name?: string
  photo_url?: string
  is_online: boolean
  created_at: string
}

// Room types
export interface Room {
  id: string
  creator_id: number
  is_active: boolean
  created_at: string
  closed_at?: string
  participants: number[]
}

export interface RoomParticipant {
  user_id: number
  joined_at: string
  left_at?: string
  user?: User
}

// Call types
export interface CallSession {
  room_id: string
  caller_id: number
  callee_id: number
  started_at: string
  ended_at?: string
  duration_seconds?: number
}

// WebRTC types
export interface ICEServer {
  urls: string | string[]
  username?: string
  credential?: string
}

export interface MediaStreamState {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

// WebSocket message types
export type WebSocketMessageType =
  | 'join-room'
  | 'leave-room'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'user-joined'
  | 'user-left'
  | 'call-rejected'

export interface WebSocketMessage {
  type: WebSocketMessageType
  room_id?: string
  target_user_id?: number
  from_user_id?: number
  user_id?: number
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
  video_enabled?: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  detail: string
  status_code?: number
}

// Auth types
export interface TelegramAuthData {
  telegram_id: number
  username?: string
  first_name: string
  last_name?: string
  photo_url?: string
}

export interface AuthResponse {
  user_id: number
  telegram_id: number
  username?: string
  display_name: string
  is_new_user: boolean
}
