// src/context/AuthContext.jsx
import { useState } from 'react'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null // ✅ ກັນ JSON.parse error
    }
  })

  const saveLogin = (user, token) => {
    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminUser', JSON.stringify(user))
    setAdmin(user)
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdmin(null)
  }

  // ✅ ເພີ່ມ isAdmin + isStaff
  const isAdmin = admin?.role === 'admin'
  const isStaff = admin?.role === 'staff'

  return (
    <AuthContext.Provider value={{ admin, saveLogin, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}