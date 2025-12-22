import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import './ThemeToggle.css'

function ThemeToggle() {
  const { theme, setTheme, cycleTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const activeTheme = themes.find(({ id }) => id === theme) || themes[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (themeId) => {
    setTheme(themeId)
    setOpen(false)
  }

  return (
    <div className="theme-toggle" data-open={open} ref={menuRef}>
      <button
        type="button"
        className="theme-toggle-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
        onDoubleClick={cycleTheme}
      >
        <div className="theme-toggle-trigger-label">
          <span className="theme-toggle-title">Tema</span>
          <span className="theme-toggle-current">{activeTheme.label}</span>
        </div>
        <div className="theme-toggle-indicator" data-theme={theme} aria-hidden="true">
          <span className="theme-toggle-dot" />
          <svg className="theme-toggle-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="theme-toggle-menu" role="listbox" aria-label="Trocar tema">
          {themes.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={id === theme}
              className="theme-option"
              data-theme-option={id}
              onClick={() => handleSelect(id)}
            >
              <span className="theme-option-bullet" aria-hidden="true" />
              <span className="theme-option-label">{label}</span>
              {id === theme && (
                <span className="theme-option-check" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle

