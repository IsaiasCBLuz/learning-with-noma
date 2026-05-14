import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('noma_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/users/login', { email, password })
    localStorage.setItem('noma_token', data.access_token)
    localStorage.setItem('noma_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const adminLogin = useCallback(async (password) => {
    const { data } = await api.post('/users/admin-login', { password })
    localStorage.setItem('noma_token', data.access_token)
    localStorage.setItem('noma_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await api.post('/users/register', { name, email, password, phone })
    localStorage.setItem('noma_token', data.access_token)
    localStorage.setItem('noma_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('noma_token')
    localStorage.removeItem('noma_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me')
      localStorage.setItem('noma_user', JSON.stringify(data))
      setUser(data)
    } catch {
      logout()
    }
  }, [logout])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
