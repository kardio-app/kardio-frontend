import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timeoutsRef = useRef({})

  const showToast = useCallback((message, type = 'success', duration = 3000, onClick = null) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const newToast = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now(),
      onClick
    }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      timeoutsRef.current[id] = setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
        delete timeoutsRef.current[id]
      }, duration)
    }
  }, [])

  const hideToast = useCallback((id) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return { showToast, hideToast, toasts }
}

