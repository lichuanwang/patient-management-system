import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, validateToken } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pm_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('pm_token')
    if (storedToken) {
      validateToken()
        .then((data) => {
          setUser(data)
          setToken(storedToken)
        })
        .catch(() => {
          localStorage.removeItem('pm_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    const jwt = data.token
    localStorage.setItem('pm_token', jwt)
    setToken(jwt)
    setUser({ email })
    return data
  }

  const logout = () => {
    localStorage.removeItem('pm_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
