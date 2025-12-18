import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'kardio-theme'

// Aplicar tema imediatamente ao carregar
function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
}

// Inicializar tema antes do React renderizar
const initialTheme = (() => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && (stored === 'dark' || stored === 'light')) {
    applyTheme(stored)
    return stored
  }
  
  // Padrão: tema escuro
  applyTheme('dark')
  return 'dark'
})()

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setThemeDirect = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme)
    }
  }

  return { theme, toggleTheme, setTheme: setThemeDirect }
}

