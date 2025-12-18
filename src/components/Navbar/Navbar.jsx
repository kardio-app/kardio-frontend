import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import ModalAccess from '../ModalAccess/ModalAccess'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import Loading from '../Loading/Loading'
import { createProject } from '../../services/api'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900)

  const isHome = location.pathname === '/home'
  const isBoard = location.pathname.startsWith('/board/')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900)
      if (window.innerWidth > 900) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (isCreating && projectResult) {
      const timer = setTimeout(() => {
        navigate(`/board/${projectResult.encryptedLink}`)
        setIsCreating(false)
        setProjectResult(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isCreating, projectResult, navigate])

  const handleStartProject = async () => {
    setIsCreating(true)
    try {
      const result = await createProject('Novo Projeto')
      setProjectResult(result)
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto. Tente novamente.')
      setIsCreating(false)
      setProjectResult(null)
    }
  }

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false)
    if (isHome) {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      navigate('/home')
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const handleExitConfirm = () => {
    setShowExitModal(false)
    setIsExiting(true)
    
    // Navegar após 2 segundos (menos tempo que criar/entrar)
    setTimeout(() => {
      navigate('/home')
      setIsExiting(false)
    }, 2000)
  }

  // Navbar simplificada para /board
  if (isBoard) {
    return (
      <>
        {isCreating && <Loading />}
        {isExiting && <Loading message="Saindo do projeto..." />}
        <nav className="navbar">
          <div className="navbar-container">
            <button
              className="navbar-logo"
              onClick={() => setShowExitModal(true)}
            >
              <span className="navbar-logo-letter">K</span>
              <span className="navbar-logo-text">kardio</span>
            </button>
            <div className="navbar-right-actions">
              <ThemeToggle />
              {isMobile ? (
                <button
                  className="navbar-mobile-toggle"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Abrir menu"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="3" x2="21" y1="6" y2="6"></line>
                    <line x1="3" x2="21" y1="12" y2="12"></line>
                    <line x1="3" x2="21" y1="18" y2="18"></line>
                  </svg>
                </button>
              ) : (
                <button
                  className="navbar-back-button"
                  onClick={() => setShowExitModal(true)}
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
                    <path d="m12 19-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                  </svg>
                  Voltar para Home
                </button>
              )}
            </div>
          </div>
        </nav>
        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-header">
              <span className="navbar-logo">
                <span className="navbar-logo-letter">K</span>
                <span className="navbar-logo-text">kardio</span>
              </span>
              <button
                className="navbar-mobile-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
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
            <div className="navbar-mobile-content">
              <div className="navbar-mobile-theme" onClick={(e) => e.stopPropagation()}>
                <ThemeToggle />
                <span>Tema</span>
              </div>
              <button
                className="navbar-mobile-link"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setShowExitModal(true)
                }}
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
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Voltar para Home
              </button>
            </div>
          </div>
        )}
        {showExitModal && createPortal(
          <ModalConfirm
            title="Sair do Projeto?"
            message="Se você sair agora, só conseguirá voltar novamente usando o código do projeto. Tem certeza que deseja sair?"
            onConfirm={handleExitConfirm}
            onCancel={() => setShowExitModal(false)}
            confirmText="Sair"
            cancelText="Cancelar"
          />,
          document.body
        )}
      </>
    )
  }

  // Navbar completa para /home
  return (
    <>
      {isCreating && <Loading />}
      <nav className="navbar">
        <div className="navbar-container">
          <button
            className="navbar-logo"
            onClick={() => navigate('/home')}
          >
            <span className="navbar-logo-letter">K</span>
            <span className="navbar-logo-text">kardio</span>
          </button>
          <div className="navbar-right-section">
            <ThemeToggle />
            {isMobile ? (
              <button
                className="navbar-mobile-toggle"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6"></line>
                  <line x1="3" x2="21" y1="12" y2="12"></line>
                  <line x1="3" x2="21" y1="18" y2="18"></line>
                </svg>
              </button>
            ) : (
              <div className="navbar-links">
              {!isHome && (
                <button
                  className="navbar-link"
                  onClick={() => navigate('/home')}
                >
                  Início
                </button>
              )}
            <button
              className="navbar-link"
              onClick={() => scrollToSection('how-it-works')}
            >
              Como Funciona
            </button>
              <div className="navbar-separator"></div>
              <button
                className="navbar-link"
                onClick={() => setShowAccessModal(true)}
              >
                Entrar no Projeto
              </button>
              <button
                className="navbar-button"
                onClick={handleStartProject}
                disabled={isCreating}
              >
                {isCreating ? 'Criando...' : 'Criar Projeto'}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="navbar-button-icon"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
            )}
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-header">
            <span className="navbar-logo">
              <span className="navbar-logo-letter">K</span>
              <span className="navbar-logo-text">kardio</span>
            </span>
            <button
              className="navbar-mobile-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
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
          <div className="navbar-mobile-content">
            <div className="navbar-mobile-theme" onClick={(e) => e.stopPropagation()}>
              <ThemeToggle />
              <span>Tema</span>
            </div>
            {!isHome && (
              <button
                className="navbar-mobile-link"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('/home')
                }}
              >
                Início
              </button>
            )}
            <button
              className="navbar-mobile-link"
              onClick={() => scrollToSection('how-it-works')}
            >
              Como Funciona
            </button>
            <div className="navbar-mobile-separator"></div>
            <button
              className="navbar-mobile-link"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setShowAccessModal(true)
              }}
            >
              Entrar no Projeto
            </button>
            <button
              className="navbar-mobile-button"
              onClick={async () => {
                setIsMobileMenuOpen(false)
                await handleStartProject()
              }}
              disabled={isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar Projeto'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {showAccessModal && (
        <ModalAccess onClose={() => setShowAccessModal(false)} />
      )}
    </>
  )
}

export default Navbar

