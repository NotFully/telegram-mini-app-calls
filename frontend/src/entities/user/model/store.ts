/**
 * User entity store using Zustand
 */

import { create } from 'zustand'
import type { UserStore, User } from './types'

const initialState = {
  currentUser: null,
  users: [],
  onlineUsers: [],
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setCurrentUser: (user) => set({ currentUser: user }),

  setUsers: (users) => set({ users }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
      onlineUsers: state.onlineUsers.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
      currentUser:
        state.currentUser?.id === userId
          ? { ...state.currentUser, ...updates }
          : state.currentUser,
    })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
      onlineUsers: state.onlineUsers.filter((user) => user.id !== userId),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))
