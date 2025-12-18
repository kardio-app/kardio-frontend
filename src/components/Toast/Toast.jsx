import { useEffect, useState, useRef } from 'react'
import './Toast.css'

function Toast({ id, message, type = 'success', duration = 3000, createdAt, onClose }) {
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
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={() => onClose()} aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="toast-progress-bar">
        <div 
          className="toast-progress-fill"
          style={{ 
            width: `${progress}%`
          }}
        />
      </div>
    </div>
  )
}

export default Toast

