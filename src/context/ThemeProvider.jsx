import { useState } from 'react'
import { ThemeContext } from './ThemeContext'
import { THEMES } from './themes'

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  )

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    setMode(next)
  }

  return (
    <ThemeContext.Provider value={{ mode, theme: THEMES[mode], toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}