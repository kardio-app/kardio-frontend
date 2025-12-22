import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'kardio-theme'

// Aplicar tema imediatamente ao carregar
function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
}

// Função para obter tema do localStorage
function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && (stored === 'dark' || stored === 'light')) {
    return stored
  }
  return 'dark'
}

// Inicializar tema antes do React renderizar
const initialTheme = (() => {
  const theme = getStoredTheme()
  applyTheme(theme)
  return theme
})()

export function useTheme() {
  // Sempre ler do localStorage ao montar o componente
  const [theme, setTheme] = useState(() => {
    // Ler do localStorage novamente ao montar
    return getStoredTheme()
  })

  // Aplicar tema e salvar no localStorage quando mudar
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  // Sincronizar com mudanças no localStorage (para múltiplas abas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue === 'dark' || e.newValue === 'light' ? e.newValue : 'dark'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Verificar se o tema no DOM está sincronizado com o estado
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    if (currentTheme !== theme) {
      applyTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      // Salvar imediatamente no localStorage
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
      return newTheme
    })
  }

  const setThemeDirect = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme)
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
    }
  }

  return { theme, toggleTheme, setTheme: setThemeDirect }
}

