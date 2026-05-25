import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { login as loginApi, getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await getMe()
        setUser(response.data)
      } catch (err) {
        console.error('Session check failed:', err)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async ({ email, password }) => {
    setError(null)
    
    if (!email || !password) {
      setError('Debes completar email y contraseña.')
      return false
    }

    try {
      const response = await loginApi({ email, password })
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
      return true
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setError(null)
  }

  const clearError = () => setError(null)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: loading,
      login,
      logout,
      error,
      clearError
    }),
    [user, loading, error]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-luxuryBlack">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
