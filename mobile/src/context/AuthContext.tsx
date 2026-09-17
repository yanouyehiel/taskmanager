import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  ready: boolean
  setAuth: (user: User, token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function restore() {
      const stored = await AsyncStorage.getMany(['token', 'user'])
      if (stored.token) setToken(stored.token)
      if (stored.user) setUser(JSON.parse(stored.user))
      setReady(true)
    }
    restore()
  }, [])

  async function setAuth(newUser: User, newToken: string) {
    await AsyncStorage.setMany({ token: newToken, user: JSON.stringify(newUser) })
    setUser(newUser)
    setToken(newToken)
  }

  async function logout() {
    await AsyncStorage.removeMany(['token', 'user'])
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
