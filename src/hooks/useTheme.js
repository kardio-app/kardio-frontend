import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'kardio-theme'
const DEFAULT_THEME = 'galaxy'

export const THEME_OPTIONS = [
  { id: 'galaxy', label: 'Galáxia' },
  { id: 'dark', label: 'Escuro' },
  { id: 'light', label: 'Claro' },
  { id: 'clorofila', label: 'Clorofila Dark' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'neon', label: 'Neon' },
]

const ALLOWED_THEMES = new Set(THEME_OPTIONS.map(({ id }) => id))
const subscribers = new Set()

let hasExplicitPreference = false

const isValidTheme = (value) => ALLOWED_THEMES.has(value)

const safeGetStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch (error) {
    console.warn('Não foi possível ler o tema salvo.', error)
    return null
  }
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

const resolveInitialTheme = () => {
  const stored = safeGetStoredTheme()

  if (isValidTheme(stored)) {
    hasExplicitPreference = true
    applyTheme(stored)
    return stored
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const fallback = prefersDark && isValidTheme('dark') ? 'dark' : DEFAULT_THEME
  applyTheme(fallback)
  return fallback
}

let currentTheme = resolveInitialTheme()

const notify = (theme) => {
  subscribers.forEach((listener) => listener(theme))
}

const persistTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Não foi possível salvar o tema selecionado.', error)
  }
}

const updateTheme = (nextTheme, { persist = true } = {}) => {
  if (!isValidTheme(nextTheme)) return

  currentTheme = nextTheme
  applyTheme(nextTheme)

  if (persist) {
    hasExplicitPreference = true
    persistTheme(nextTheme)
  }

  notify(nextTheme)
}

const getNextTheme = (current) => {
  const index = THEME_OPTIONS.findIndex(({ id }) => id === current)
  if (index === -1) return DEFAULT_THEME
  const nextIndex = (index + 1) % THEME_OPTIONS.length
  return THEME_OPTIONS[nextIndex].id
}

export function useTheme() {
  const [theme, setThemeState] = useState(currentTheme)

  useEffect(() => {
    subscribers.add(setThemeState)
    return () => subscribers.delete(setThemeState)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const handleMediaChange = (event) => {
      if (!hasExplicitPreference) {
        updateTheme(event.matches ? 'dark' : DEFAULT_THEME, { persist: false })
      }
    }

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && isValidTheme(event.newValue)) {
        hasExplicitPreference = true
        updateTheme(event.newValue, { persist: false })
      }
    }

    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleMediaChange)
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      }
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const cycleTheme = () => {
    updateTheme(getNextTheme(theme))
  }

  const setTheme = (newTheme) => {
    updateTheme(newTheme)
  }

  return { theme, setTheme, cycleTheme, themes: THEME_OPTIONS }
}

