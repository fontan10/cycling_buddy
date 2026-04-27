import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { apiFetch, BASE } from '../lib/api'

export interface User {
  _id: string
  username: string
  email?: string
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (login: string, password: string) => Promise<void>
  register: (username: string, password: string, email?: string) => Promise<void>
  logout: () => void
  loginWithGoogle: () => void
  handleOAuthCallback: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const me = await apiFetch<User>('/auth/me')
      setUser(me)
    } catch {
      setUser(null)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchMe()
    } else {
      setIsLoading(false)
    }
  }, [fetchMe])

  const saveTokenAndFetch = useCallback(
    async (token: string) => {
      localStorage.setItem('token', token)
      await fetchMe()
    },
    [fetchMe],
  )

  const login = useCallback(
    async (login: string, password: string) => {
      const { token } = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      })
      await saveTokenAndFetch(token)
    },
    [saveTokenAndFetch],
  )

  const register = useCallback(
    async (username: string, password: string, email?: string) => {
      const { token } = await apiFetch<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email }),
      })
      await saveTokenAndFetch(token)
    },
    [saveTokenAndFetch],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${BASE}/auth/google`
  }, [])

  const handleOAuthCallback = useCallback(
    async (token: string) => {
      await saveTokenAndFetch(token)
    },
    [saveTokenAndFetch],
  )

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, loginWithGoogle, handleOAuthCallback }),
    [user, isLoading, login, register, logout, loginWithGoogle, handleOAuthCallback],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
