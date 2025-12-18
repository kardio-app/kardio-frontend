import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CookieBanner.css'

function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem('kardio-cookie-consent')
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('kardio-cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('kardio-cookie-consent', 'rejected')
    setShowBanner(false)
  }

  const handleClose = () => {
    localStorage.setItem('kardio-cookie-consent', 'closed')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <p className="cookie-banner-message">
            Este site utiliza cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
            <Link to="/cookies" className="cookie-banner-link">Política de Cookies</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button 
            className="cookie-banner-button cookie-banner-button-accept"
            onClick={handleAccept}
          >
            Aceitar
          </button>
          <button 
            className="cookie-banner-button cookie-banner-button-reject"
            onClick={handleReject}
          >
            Recusar
          </button>
          <button 
            className="cookie-banner-close"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner

