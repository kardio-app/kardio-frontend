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
          <h3 className="cookie-banner-title">Utilizamos Cookies</h3>
          <p className="cookie-banner-message">
            Usamos cookies para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando, você concorda com nossa{' '}
            <Link to="/cookies" className="cookie-banner-link">política de cookies</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-reject"
            onClick={handleReject}
          >
            Rejeitar
          </button>
          <button
            type="button"
            className="cookie-banner-button cookie-banner-button-accept"
            onClick={handleAccept}
          >
            Aceitar
          </button>
        </div>
        <button
          type="button"
          className="cookie-banner-close"
          onClick={handleClose}
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CookieBanner


