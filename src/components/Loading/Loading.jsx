import { useEffect } from 'react'
import './Loading.css'

function Loading({ message = 'Criando novo projeto...' }) {
  useEffect(() => {
    // Desabilitar scroll do body e html quando o Loading estiver ativo
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyOverflowX = document.body.style.overflowX
    const originalBodyOverflowY = document.body.style.overflowY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlOverflowX = document.documentElement.style.overflowX
    const originalHtmlOverflowY = document.documentElement.style.overflowY
    
    document.body.style.overflow = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.body.style.overflowY = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    document.documentElement.style.overflowY = 'hidden'
    
    // Reabilitar scroll quando o componente desmontar
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.overflowX = originalBodyOverflowX
      document.body.style.overflowY = originalBodyOverflowY
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.overflowX = originalHtmlOverflowX
      document.documentElement.style.overflowY = originalHtmlOverflowY
    }
  }, [])

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-boxes">
          <div className="loading-box loading-box-1"></div>
          <div className="loading-box loading-box-2"></div>
          <div className="loading-box loading-box-3"></div>
          <div className="loading-box loading-box-4"></div>
          <div className="loading-box loading-box-5"></div>
          <div className="loading-box loading-box-6"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

export default Loading


