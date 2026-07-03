import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch } from '../services/api'

interface AuthUser {
  id: string
  name: string
  email: string
  profileImage?: string | null
  createdAt?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<AuthUser>) => void
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) return null
    return { 
      id: payload.id, 
      name: payload.name, 
      email: payload.email,
      profileImage: payload.profileImage,
      createdAt: payload.createdAt
    }
  } catch {
    return null
  }
}

function loadStoredAuth(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem('scopeai_token')
  if (!token) return { token: null, user: null }
  const user = decodeToken(token)
  if (!user) {
    localStorage.removeItem('scopeai_token')
    return { token: null, user: null }
  }
  return { token, user }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const stored = loadStoredAuth()
    setToken(stored.token)
    setUser(stored.user)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const decoded = decodeToken(res.token)
    if (!decoded) throw new Error('Invalid token received')
    localStorage.setItem('scopeai_token', res.token)
    setToken(res.token)
    setUser(decoded)
    // Dispatch event to notify ThemeContext to reload theme
    window.dispatchEvent(new Event('user-login'))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('scopeai_token')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }),
    [user, token, isLoading, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
