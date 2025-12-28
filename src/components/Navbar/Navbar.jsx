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
import DocsSidebar from '../DocsSidebar/DocsSidebar'
import { useDocsContext } from '../../contexts/DocsContext'
import ModalSaveProject from '../ModalSaveProject/ModalSaveProject'
import { createProject, getProject, accessProject } from '../../services/api'
import { saveProject, getSavedProjects, deleteSavedProject, updateSavedProjectName } from '../../utils/savedProjects'
import './Navbar.css'
import '../SavedProjectsSidebar/SavedProjectsSidebar.css'

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
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [showShareCodeModal, setShowShareCodeModal] = useState(false)
  const [accessCode, setAccessCode] = useState(null)
  const [shareCode, setShareCode] = useState(null)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  // Estados para projetos salvos (menu mobile board-gerencial)
  const [savedProjects, setSavedProjects] = useState([])
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [saveProjectCode, setSaveProjectCode] = useState('')
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [saveProjectError, setSaveProjectError] = useState('')
  const lastScrollY = useRef(0)
  
  // Estados locais para docs quando contexto não está disponível
  const [localDocsSelectedTopic, setLocalDocsSelectedTopic] = useState(null)
  const [localDocsExpandedItems, setLocalDocsExpandedItems] = useState({})
  const [localDocsShowOverview, setLocalDocsShowOverview] = useState(false)
  
  // Usar o contexto de Docs se disponível, senão usar estados locais
  const docsContextFromHook = useDocsContext()
  const docsContext = docsContextFromHook || {
    selectedTopic: localDocsSelectedTopic,
    setSelectedTopic: setLocalDocsSelectedTopic,
    expandedItems: localDocsExpandedItems,
    setExpandedItems: setLocalDocsExpandedItems,
    showOverview: localDocsShowOverview,
    setShowOverview: setLocalDocsShowOverview,
  }

  const maskCode = (code) => {
    if (!code || code.length < 2) return code
    return code.substring(0, 2) + '****'
  }

  const isHome = location.pathname === '/home'
  const isDocs = location.pathname === '/docs'
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
      // Quando fechar o menu mobile, restaurar scroll apenas se não estiver em /board
      if (!isBoard && !isBoardGerencial) {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        document.body.style.height = ''
        document.body.style.maxHeight = ''
        document.documentElement.style.height = ''
        document.documentElement.style.maxHeight = ''
      }
    }
    return () => {
      // Não restaurar aqui para evitar conflitos com o Board.jsx
    }
  }, [isMobileMenuOpen, isBoard, isBoardGerencial])

  // Handler para fechar menu mobile quando clicar fora (apenas para board-gerencial)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && isBoardGerencial && boardId) {
        const sidebar = document.querySelector('.saved-projects-sidebar')
        if (sidebar && !sidebar.contains(event.target)) {
          // Verificar se não é um modal aberto
          const modals = document.querySelectorAll('.modal-confirm-backdrop, .share-modal-overlay')
          const isClickOnModal = Array.from(modals).some(modal => modal.contains(event.target))
          
          // Verificar se o click foi no botão de menu
          const menuButton = event.target.closest('.navbar-mobile-toggle')
          if (menuButton) {
            return // Não fechar se o click foi no botão de menu
          }
          
          if (!isClickOnModal) {
            setIsMobileMenuOpen(false)
          }
        }
      }
    }

    if (isMobileMenuOpen && isBoardGerencial && boardId) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen, isBoardGerencial, boardId])

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
    // Se estiver na página /docs, navegar diretamente sem modal
    if (isDocs) {
      navigate('/home')
      return
    }
    
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
    
    // Restaurar scroll antes de navegar
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.style.height = ''
    document.body.style.maxHeight = ''
    document.documentElement.style.height = ''
    document.documentElement.style.maxHeight = ''
    
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
    if ((isBoard || isBoardGerencial) && boardId) {
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
  }, [isBoard, isBoardGerencial, boardId])

  // Handlers para código de acesso e compartilhamento (board-gerencial)
  const handleShowAccessCode = async () => {
    setShowAccessCodeModal(true)
    setLoadingCodes(true)
    setShowAccessCode(false)
    
    try {
      const projectData = await getProject(boardId)
      setAccessCode(projectData.accessCode)
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error)
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleShowShareCode = async () => {
    setShowShareCodeModal(true)
    setLoadingCodes(true)
    
    try {
      const projectData = await getProject(boardId)
      setShareCode(projectData.shareCode)
    } catch (error) {
      console.error('Erro ao buscar código de compartilhamento:', error)
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleCopyAccessCode = async () => {
    if (accessCode) {
      try {
        await navigator.clipboard.writeText(accessCode)
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar código:', error)
      }
    }
  }

  const handleCopyShareCode = async () => {
    if (shareCode) {
      try {
        await navigator.clipboard.writeText(shareCode)
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar código:', error)
      }
    }
  }

  // Handlers para projetos salvos (menu mobile board-gerencial)
  const loadSavedProjects = async () => {
    const saved = getSavedProjects()
    setSavedProjects(saved)
    
    // Atualizar nomes dos projetos do servidor em background
    if (saved.length > 0) {
      await Promise.allSettled(
        saved.map(async (project) => {
          try {
            let result
            if (project.encryptedLink) {
              try {
                const projectData = await getProject(project.encryptedLink)
                result = {
                  name: projectData.name,
                  encryptedLink: project.encryptedLink,
                  accessCode: projectData.accessCode || project.code
                }
              } catch (getProjectError) {
                result = await accessProject(project.code)
              }
            } else {
              result = await accessProject(project.code)
            }
            
            if (result.name && result.name !== project.name) {
              saveProject({
                name: result.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink || project.encryptedLink
              })
            }
            if (result.encryptedLink && result.encryptedLink !== project.encryptedLink) {
              saveProject({
                name: project.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink
              })
            }
          } catch (error) {
            console.warn(`Erro ao atualizar projeto ${project.code}:`, error)
          }
        })
      )
      setSavedProjects(getSavedProjects())
    }
  }

  const handleSaveProjectMobile = async (e) => {
    e.preventDefault()
    
    if (!saveProjectCode.trim()) {
      setSaveProjectError('Por favor, insira um código')
      return
    }

    setIsSavingProject(true)
    setSaveProjectError('')

    try {
      const result = await accessProject(saveProjectCode.trim().toUpperCase())
      
      saveProject({
        name: result.name || 'Projeto sem nome',
        code: saveProjectCode.trim().toUpperCase(),
        encryptedLink: result.encryptedLink
      })

      setSaveProjectCode('')
      loadSavedProjects()
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      setSaveProjectError(error.message || 'Código inválido')
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleLoadProjectMobile = async (project) => {
    setIsMobileMenuOpen(false)
    try {
      const result = await accessProject(project.code)
      
      saveProject({
        name: result.name || project.name,
        code: project.code,
        encryptedLink: result.encryptedLink
      })
      
      if (result.type === 'managerial') {
        navigate(`/board-gerencial/${result.encryptedLink}`)
      } else {
        navigate(`/board/${result.encryptedLink}`)
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
      alert('Erro ao carregar projeto: ' + error.message)
    }
  }

  const handleEditProjectMobile = (e, projectId) => {
    e.stopPropagation()
    const project = savedProjects.find(p => p.id === projectId)
    if (project) {
      setEditingProjectId(projectId)
      setEditProjectName(project.name)
    }
  }

  const handleSaveEditMobile = async (e, projectId) => {
    e.stopPropagation()
    if (!editProjectName.trim()) return

    try {
      updateSavedProjectName(projectId, editProjectName.trim())
      setEditingProjectId(null)
      setEditProjectName('')
      loadSavedProjects()
    } catch (error) {
      console.error('Erro ao salvar edição:', error)
    }
  }

  const handleCancelEditMobile = (e) => {
    e.stopPropagation()
    setEditingProjectId(null)
    setEditProjectName('')
  }

  const handleDeleteProjectMobile = async (e, projectId) => {
    e.stopPropagation()
    try {
      deleteSavedProject(projectId)
      loadSavedProjects()
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
    }
  }

  // Carregar projetos salvos quando o menu mobile do board-gerencial abrir
  useEffect(() => {
    if (isMobileMenuOpen && isBoardGerencial && boardId) {
      loadSavedProjects()
    }
  }, [isMobileMenuOpen, isBoardGerencial, boardId])

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

  // Navbar simplificada para /board, /board-gerencial e /docs
  if (isBoard || isBoardGerencial || isDocs) {
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
                  { label: isDocs ? 'Docs' : isBoardGerencial ? 'Board Gerencial' : 'Board' }
                ]}
                onNavigate={isDocs ? (href) => navigate(href) : handleExitClick}
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
                    } else if (isDocs) {
                      // No /docs, abrir o menu mobile com sidebar de docs
                      setIsMobileMenuOpen(true);
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
          <>
            {isDocs ? (
              <div className="saved-projects-sidebar saved-projects-sidebar-open" style={{ zIndex: 200 }}>
                <div className="saved-projects-header">
                  <h3 className="saved-projects-title">Documentação</h3>
                  <button
                    className="saved-projects-close"
                    onClick={() => setIsMobileMenuOpen(false)}
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="saved-projects-actions">
                  <div className="saved-projects-theme">
                    <ThemeToggle />
                  </div>
                  <button
                    className="saved-projects-back-button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      // Restaurar scroll antes de navegar
                      document.body.style.overflow = ''
                      document.documentElement.style.overflow = ''
                      document.body.style.height = ''
                      document.body.style.maxHeight = ''
                      document.documentElement.style.height = ''
                      document.documentElement.style.maxHeight = ''
                      // Pequeno delay para garantir que o estado seja limpo
                      setTimeout(() => {
                        navigate('/home')
                      }, 0)
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
                <div className="saved-projects-list" style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
                  <DocsSidebar
                    selectedTopic={docsContext?.selectedTopic || null}
                    setSelectedTopic={docsContext?.setSelectedTopic || (() => {})}
                    showOverview={docsContext?.showOverview || false}
                    setShowOverview={docsContext?.setShowOverview || (() => {})}
                    expandedItems={docsContext?.expandedItems || {}}
                    setExpandedItems={docsContext?.setExpandedItems || (() => {})}
                    onItemClick={() => setIsMobileMenuOpen(false)}
                    isMobile={false}
                  />
                </div>
              </div>
            ) : isBoardGerencial && boardId ? (
              <div className="saved-projects-sidebar saved-projects-sidebar-open" style={{ zIndex: 200 }}>
                <div className="saved-projects-header">
                  <h3 className="saved-projects-title">Configurações</h3>
                  <button
                    className="saved-projects-close"
                    onClick={() => setIsMobileMenuOpen(false)}
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="saved-projects-actions">
                  <div className="saved-projects-theme">
                    <ThemeToggle />
                  </div>
                  <button
                    className="saved-projects-copy-button"
                    onClick={() => {
                      handleShowAccessCode()
                      setIsMobileMenuOpen(false)
                    }}
                    title="Código de acesso"
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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Código de Acesso
                  </button>
                  <button
                    className="saved-projects-copy-button"
                    onClick={() => {
                      handleShowShareCode()
                      setIsMobileMenuOpen(false)
                    }}
                    title="Código de compartilhamento"
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
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Compartilhar
                  </button>
                  <button
                    className="saved-projects-back-button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      // Restaurar scroll antes de navegar
                      document.body.style.overflow = ''
                      document.documentElement.style.overflow = ''
                      document.body.style.height = ''
                      document.body.style.maxHeight = ''
                      document.documentElement.style.height = ''
                      document.documentElement.style.maxHeight = ''
                      handleExitClick()
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
                <div className="saved-projects-list">
                  <form className="saved-projects-save-form" onSubmit={handleSaveProjectMobile}>
                    <input
                      type="text"
                      className="saved-projects-save-input"
                      placeholder="Insira o código aqui para salvar localmente"
                      value={saveProjectCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().slice(0, 6)
                        setSaveProjectCode(value)
                        setSaveProjectError('')
                      }}
                      maxLength={6}
                      disabled={isSavingProject}
                    />
                    <button
                      type="submit"
                      className="saved-projects-save-button"
                      disabled={isSavingProject || !saveProjectCode.trim()}
                    >
                      {isSavingProject ? 'Salvando...' : 'Salvar'}
                    </button>
                    {saveProjectError && (
                      <p className="saved-projects-save-error">{saveProjectError}</p>
                    )}
                  </form>
                  {savedProjects.length > 0 && (
                    <div className="saved-projects-items">
                      {savedProjects.map((project) => (
                        <div
                          key={project.id}
                          className="saved-project-item"
                          onClick={() => handleLoadProjectMobile(project)}
                        >
                          {editingProjectId === project.id ? (
                            <div className="saved-project-edit" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                className="saved-project-edit-input"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEditMobile(e, project.id)
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditMobile(e)
                                  }
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="saved-project-edit-actions">
                                <button
                                  className="saved-project-edit-save"
                                  onClick={(e) => handleSaveEditMobile(e, project.id)}
                                >
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
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </button>
                                <button
                                  className="saved-project-edit-cancel"
                                  onClick={handleCancelEditMobile}
                                >
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
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="saved-project-content">
                                <div className="saved-project-icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                    <path d="M9 3v18"></path>
                                    <path d="M9 12h6"></path>
                                  </svg>
                                </div>
                                <div className="saved-project-info">
                                  <p className="saved-project-name">{project.name}</p>
                                  <p className="saved-project-code">Código: {maskCode(project.code)}</p>
                                </div>
                              </div>
                              <div className="saved-project-actions">
                                <button
                                  className="saved-project-delete-btn"
                                  onClick={(e) => handleDeleteProjectMobile(e, project.id)}
                                  title="Deletar projeto"
                                >
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
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
          </>
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
        {/* Modal de Código de Acesso (board-gerencial mobile) */}
        {isBoardGerencial && boardId && showAccessCodeModal && createPortal(
          <div className="share-modal-overlay" onClick={() => {
            setShowAccessCodeModal(false)
            setAccessCode(null)
            setShowAccessCode(false)
            setCopiedCode(false)
          }}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <h2>Código de Acesso</h2>
                <button className="share-modal-close" onClick={() => {
                  setShowAccessCodeModal(false)
                  setAccessCode(null)
                  setShowAccessCode(false)
                  setCopiedCode(false)
                }}>
                  ×
                </button>
              </div>
              <div className="share-modal-content">
                <p className="share-modal-label">Código de Acesso:</p>
                {loadingCodes ? (
                  <div className="share-modal-loading">Carregando...</div>
                ) : accessCode ? (
                  <div className="share-modal-code-container">
                    <div className="share-modal-code-with-eye">
                      <span className="share-modal-code-masked">
                        {showAccessCode ? accessCode : '******'}
                      </span>
                      <button
                        className="share-modal-eye-button"
                        onClick={() => setShowAccessCode(!showAccessCode)}
                        title={showAccessCode ? 'Ocultar código' : 'Mostrar código'}
                      >
                        {showAccessCode ? (
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
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    <button
                      className="share-modal-copy-button"
                      onClick={handleCopyAccessCode}
                      title="Copiar código"
                    >
                      {copiedCode ? (
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
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      ) : (
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
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="share-modal-error">Erro ao carregar código</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
        {/* Modal de Código de Compartilhamento (board-gerencial mobile) */}
        {isBoardGerencial && boardId && showShareCodeModal && createPortal(
          <div className="share-modal-overlay" onClick={() => {
            setShowShareCodeModal(false)
            setShareCode(null)
            setCopiedCode(false)
          }}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <h2>Código de Compartilhamento</h2>
                <button className="share-modal-close" onClick={() => {
                  setShowShareCodeModal(false)
                  setShareCode(null)
                  setCopiedCode(false)
                }}>
                  ×
                </button>
              </div>
              <div className="share-modal-content">
                <p className="share-modal-label">Código de Compartilhamento:</p>
                {loadingCodes ? (
                  <div className="share-modal-loading">Carregando...</div>
                ) : shareCode ? (
                  <div className="share-modal-code-container">
                    <button
                      className="share-modal-code"
                      onClick={handleCopyShareCode}
                      title="Copiar código"
                    >
                      {shareCode}
                    </button>
                    <button
                      className="share-modal-copy-button"
                      onClick={handleCopyShareCode}
                      title="Copiar código"
                    >
                      {copiedCode ? (
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
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      ) : (
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
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="share-modal-error">Erro ao carregar código</div>
                )}
              </div>
            </div>
          </div>,
          document.body
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
              <button
                className="navbar-link"
                onClick={() => navigate('/docs')}
              >
                Docs
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
      {isMobileMenuOpen && !isBoard && !isDocs && (
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
            <button
              className="navbar-mobile-link"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/docs')
              }}
            >
              Docs
            </button>
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

