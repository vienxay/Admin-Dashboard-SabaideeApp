import { useContext } from 'react'
import { ThemeContext } from './ThemeContext' // ✅ ຍັງໃຊ້ຊື່ດຽວກັນ

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme ຕ້ອງໃຊ້ໃນ <ThemeProvider>')
  return ctx
}