/**
 * Room entity store using Zustand
 */

import { create } from 'zustand'
import type { RoomStore, RoomParticipant } from './types'

const initialState = {
  currentRoom: null,
  rooms: [],
  isLoading: false,
  error: null,
}

export const useRoomStore = create<RoomStore>((set) => ({
  ...initialState,

  setCurrentRoom: (room) => set({ currentRoom: room }),

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room],
    })),

  updateRoom: (roomId, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
      currentRoom:
        state.currentRoom?.id === roomId
          ? { ...state.currentRoom, ...updates }
          : state.currentRoom,
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== roomId),
      currentRoom:
        state.currentRoom?.id === roomId ? null : state.currentRoom,
    })),

  addParticipant: (roomId, participant: RoomParticipant) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, participants: [...room.participants, participant] }
          : room
      ),
      currentRoom:
        state.currentRoom?.id === roomId
          ? {
              ...state.currentRoom,
              participants: [...state.currentRoom.participants, participant],
            }
          : state.currentRoom,
    })),

  removeParticipant: (roomId, userId) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              participants: room.participants.filter(
                (p) => p.user_id !== userId
              ),
            }
          : room
      ),
      currentRoom:
        state.currentRoom?.id === roomId
          ? {
              ...state.currentRoom,
              participants: state.currentRoom.participants.filter(
                (p) => p.user_id !== userId
              ),
            }
          : state.currentRoom,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))
