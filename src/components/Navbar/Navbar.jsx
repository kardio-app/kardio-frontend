import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import ModalAccess from '../ModalAccess/ModalAccess'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import Loading from '../Loading/Loading'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import SearchBar from '../SearchBar/SearchBar'
import SavedProjectsSidebar from '../SavedProjectsSidebar/SavedProjectsSidebar'
import ModalSaveProject from '../ModalSaveProject/ModalSaveProject'
import { createProject, getProject } from '../../services/api'
import { saveProject, getSavedProjects } from '../../utils/savedProjects'
import './Navbar.css'

const SIDEBAR_STORAGE_KEY = 'kardio-sidebar-open'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1100)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [showSaveProjectModal, setShowSaveProjectModal] = useState(false)
  const [projectCode, setProjectCode] = useState(null)
  const [projectName, setProjectName] = useState(null)
  const lastScrollY = useRef(0)

  const isHome = location.pathname === '/home'
  const isBoard = location.pathname.startsWith('/board/') && !location.pathname.startsWith('/board-gerencial/')
  const isBoardGerencial = location.pathname.startsWith('/board-gerencial/')
  const boardId = isBoard ? location.pathname.split('/board/')[1] : isBoardGerencial ? location.pathname.split('/board-gerencial/')[1] : null

  // Estado da sidebar persistido no localStorage
  const getInitialSidebarState = () => {
    if (!isBoard) return false
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      return stored === 'true'
    } catch (error) {
      console.warn('Não foi possível ler o estado da sidebar.', error)
      return false
    }
  }
  const [showSavedProjects, setShowSavedProjects] = useState(getInitialSidebarState)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1100)
      if (window.innerWidth > 1100) {
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

  // Lógica de scroll para mostrar/esconder navbar na home
  useEffect(() => {
    if (!isHome) {
      setIsNavbarVisible(true)
      lastScrollY.current = 0
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Se estiver no topo, sempre mostrar
      if (currentScrollY < 10) {
        setIsNavbarVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      // Calcular diferença de scroll
      const scrollDifference = currentScrollY - lastScrollY.current
      
      // Se a diferença for muito pequena, não fazer nada (evitar flickering)
      if (Math.abs(scrollDifference) < 5) {
        lastScrollY.current = currentScrollY
        return
      }

      // Se estiver scrollando para cima (scrollDifference < 0), sempre mostrar
      if (scrollDifference < 0) {
        setIsNavbarVisible(true)
      } 
      // Se estiver scrollando para baixo (scrollDifference > 0), esconder (após 100px)
      else if (scrollDifference > 0 && currentScrollY > 100) {
        setIsNavbarVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    // Resetar quando mudar de página
    lastScrollY.current = window.scrollY
    setIsNavbarVisible(true)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

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

  const handleStartProject = () => {
    if (isHome) {
      // Se já estiver na home, abrir o modal diretamente
      // Precisamos passar uma função ou usar um contexto
      // Por enquanto, vamos usar query params
      navigate('/home?create=true')
    } else {
      // Redirecionar para /home com query param para abrir o modal
      navigate('/home?create=true')
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

  // Verificar se o projeto atual está salvo localmente
  const isProjectSaved = () => {
    if (!boardId || !projectCode) return false
    const savedProjects = getSavedProjects()
    return savedProjects.some(
      p => p.code === projectCode || p.encryptedLink === boardId
    )
  }

  const handleExitClick = () => {
    if (isProjectSaved()) {
      // Se estiver salvo, mostrar modal normal
      setShowExitModal(true)
    } else {
      // Se não estiver salvo, mostrar modal de aviso
      setShowExitModal(true)
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

  const handleSaveAndExit = () => {
    if (projectCode && boardId && projectName) {
      try {
        saveProject({
          name: projectName,
          code: projectCode,
          encryptedLink: boardId
        })
        // Após salvar, sair normalmente
        handleExitConfirm()
      } catch (error) {
        console.error('Erro ao salvar projeto:', error)
        alert('Erro ao salvar projeto. Tente novamente.')
      }
    } else {
      // Se não tiver as informações, apenas sair
      handleExitConfirm()
    }
  }

  // Buscar informações do projeto quando estiver no board
  useEffect(() => {
    if (isBoard && boardId) {
      const fetchProjectInfo = async () => {
        try {
          const projectData = await getProject(boardId)
          setProjectCode(projectData.accessCode)
          setProjectName(projectData.name)
        } catch (error) {
          console.error('Erro ao buscar informações do projeto:', error)
        }
      }
      fetchProjectInfo()
    }
  }, [isBoard, boardId])

  const handleSaveProject = () => {
    if (projectCode && boardId) {
      setShowSaveProjectModal(true)
    } else {
      alert('Erro ao obter informações do projeto. Tente novamente.')
    }
  }

  const handleSearch = (searchValue) => {
    // Função para pesquisa - pode ser expandida no futuro
    console.log('Pesquisando:', searchValue)
  }

  // Aplicar estado inicial da sidebar ao carregar
  useEffect(() => {
    if (isBoard && showSavedProjects) {
      document.body.classList.add('sidebar-open')
    }
    return () => {
      if (!isBoard) {
        document.body.classList.remove('sidebar-open')
      }
    }
  }, [isBoard])

  // Persistir estado da sidebar no localStorage
  useEffect(() => {
    if (isBoard) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, showSavedProjects.toString())
        if (showSavedProjects) {
          document.body.classList.add('sidebar-open')
        } else {
          document.body.classList.remove('sidebar-open')
        }
      } catch (error) {
        console.warn('Não foi possível salvar o estado da sidebar.', error)
      }
    }
  }, [showSavedProjects, isBoard])

  // Navbar simplificada para /board e /board-gerencial
  if (isBoard || isBoardGerencial) {
    return (
      <>
        {isCreating && <Loading />}
        {isExiting && <Loading message="Saindo do projeto..." />}
        <nav className="navbar navbar-fixed">
          <div className="navbar-container">
            <div className="navbar-breadcrumb-wrapper">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/home' },
                  { label: isBoardGerencial ? 'Board Gerencial' : 'Board' }
                ]}
                onNavigate={handleExitClick}
              />
            </div>
            {!isMobile && (
              <div className="navbar-center">
                <SearchBar onSearch={handleSearch} placeholder="Pesquisar..." />
              </div>
            )}
            <div className="navbar-right-actions">
              {isMobile ? (
                <button
                  className="navbar-mobile-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    // No /board, abrir diretamente a sidebar
                    if (isBoard) {
                      // Se já estiver aberta, apenas fechar (evita bug de abrir/fechar)
                      if (showSavedProjects) {
                        setShowSavedProjects(false);
                      } else {
                        setShowSavedProjects(true);
                      }
                    } else {
                      setIsMobileMenuOpen(true);
                    }
                  }}
                  aria-label={isBoard ? "Abrir menu" : "Abrir menu"}
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
                  className="navbar-menu-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que o click fora interfira
                    setShowSavedProjects(!showSavedProjects); // Toggle normal
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
                    <line x1="3" x2="21" y1="6" y2="6"></line>
                    <line x1="3" x2="21" y1="12" y2="12"></line>
                    <line x1="3" x2="21" y1="18" y2="18"></line>
                  </svg>
                  Menu
                </button>
              )}
            </div>
          </div>
        </nav>
        {isMobileMenuOpen && !isBoard && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-header">
              <span className="navbar-logo">
                <span className="navbar-logo-letter">K</span>
                <span className="navbar-logo-text">@kardiosoftware</span>
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
              {/* Conteúdo do menu mobile para /home */}
            </div>
          </div>
        )}
        {showExitModal && createPortal(
          isProjectSaved() ? (
            <ModalConfirm
              title="Sair do Projeto?"
              message="Tem certeza que deseja sair do projeto?"
              onConfirm={handleExitConfirm}
              onCancel={() => setShowExitModal(false)}
              onClose={() => setShowExitModal(false)}
              confirmText="Sair"
              cancelText="Cancelar"
              showCloseButton={true}
            />
          ) : (
            <ModalConfirm
              title="Projeto não salvo localmente"
              message="Este projeto não está salvo localmente. Se você sair agora, precisará do código do projeto para acessá-lo novamente. Você pode salvar o projeto pelo menu lateral (ícone de Menu) antes de sair, ou salvar agora."
              onConfirm={handleSaveAndExit}
              onCancel={handleExitConfirm}
              onClose={() => setShowExitModal(false)}
              confirmText="Salvar e Sair"
              cancelText="Sair sem Salvar"
              showCloseButton={true}
            />
          ),
          document.body
        )}
        <SavedProjectsSidebar
          isOpen={showSavedProjects}
          onClose={() => setShowSavedProjects(false)}
          onExit={handleExitClick}
        />
        {showSaveProjectModal && (
          <ModalSaveProject
            isOpen={showSaveProjectModal}
            onClose={() => setShowSaveProjectModal(false)}
            projectCode={projectCode}
            projectName={projectName}
            encryptedLink={boardId}
          />
        )}
      </>
    )
  }

  // Navbar completa para /home
  return (
    <>
      {isCreating && <Loading />}
      <nav className={`navbar ${!isNavbarVisible ? 'navbar-hidden' : ''}`}>
        <div className="navbar-container">
          <button
            className="navbar-logo"
            onClick={() => navigate('/home')}
          >
            <span className="navbar-logo-letter">K</span>
            <span className="navbar-logo-text">@kardiosoftware</span>
          </button>
          <div className="navbar-right-section">
            {!isMobile && <ThemeToggle />}
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
              <div className="navbar-search-wrapper">
                <SearchBar onSearch={handleSearch} placeholder="Pesquisar projetos..." />
              </div>
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
              <span className="navbar-logo-text">@kardiosoftware</span>
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
            <div className="navbar-mobile-search-wrapper">
              <SearchBar onSearch={handleSearch} placeholder="Pesquisar projetos..." />
            </div>
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

