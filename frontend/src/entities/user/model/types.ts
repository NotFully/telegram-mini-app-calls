/**
 * User entity types
 */

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

export interface UserState {
  currentUser: User | null
  users: User[]
  onlineUsers: User[]
  isLoading: boolean
  error: string | null
}

export interface UserActions {
  setCurrentUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  setOnlineUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (userId: number, updates: Partial<User>) => void
  removeUser: (userId: number) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type UserStore = UserState & UserActions
