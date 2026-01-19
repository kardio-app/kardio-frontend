import { useEffect, useState, useRef } from 'react'
import './Toast.css'

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

function Toast({ id, message, type = 'success', duration = 3000, createdAt, onClick, onClose }) {
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef(createdAt || Date.now())
  const animationFrameRef = useRef(null)

  useEffect(() => {
    startTimeRef.current = createdAt || Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, duration - elapsed)
      const newProgress = (remaining / duration) * 100
      
      setProgress(newProgress)

      if (newProgress > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        onClose()
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [duration, createdAt, onClose])

  return (
    <div className={`toast toast-${type} ${onClick ? 'toast-clickable' : ''}`} onClick={onClick} role="alert">
      <div className="toast-icon" aria-hidden>{icons[type] || icons.info}</div>
      <div className="toast-body">
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="toast-progress" aria-hidden>
        <div className="toast-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default Toast

