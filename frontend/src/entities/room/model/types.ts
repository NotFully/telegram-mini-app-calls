/**
 * Room entity types
 */

import type { User } from '../../user/model/types'

export interface RoomParticipant {
  user_id: number
  joined_at: string
  left_at?: string
  user?: User
}

export interface Room {
  id: string
  creator_id: number
  is_active: boolean
  created_at: string
  closed_at?: string
  participants: RoomParticipant[]
}

export interface RoomState {
  currentRoom: Room | null
  rooms: Room[]
  isLoading: boolean
  error: string | null
}

export interface RoomActions {
  setCurrentRoom: (room: Room | null) => void
  setRooms: (rooms: Room[]) => void
  addRoom: (room: Room) => void
  updateRoom: (roomId: string, updates: Partial<Room>) => void
  removeRoom: (roomId: string) => void
  addParticipant: (roomId: string, participant: RoomParticipant) => void
  removeParticipant: (roomId: string, userId: number) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type RoomStore = RoomState & RoomActions
