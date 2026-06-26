import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('noma_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('noma_access_token')
    if (token && !user) {
      api.get('/me')
        .then(res => {
          setUser(res.data)
          localStorage.setItem('noma_user', JSON.stringify(res.data))
        })
        .catch(() => {
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password })
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('noma_access_token', access_token)
    localStorage.setItem('noma_refresh_token', refresh_token)
    localStorage.setItem('noma_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  function logout() {
    localStorage.removeItem('noma_access_token')
    localStorage.removeItem('noma_refresh_token')
    localStorage.removeItem('noma_user')
    setUser(null)
  }

  function updateUser(userData) {
    setUser(userData)
    localStorage.setItem('noma_user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
