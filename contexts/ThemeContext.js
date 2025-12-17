/**
 * Theme Context
 * Manages theme state (light, dark, muted) across the application
 */

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light'
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.className = root.className.replace(/theme-\w+/g, '')
      root.classList.add(`theme-${newTheme}`)
    }
  }

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

