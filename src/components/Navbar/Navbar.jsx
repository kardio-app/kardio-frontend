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
import { createProject, getProject, accessProject, updateProjectName } from '../../services/api'
import ModalFilters from '../ModalFilters/ModalFilters'
import ModalFiltersGerencial from '../ModalFiltersGerencial/ModalFiltersGerencial'
import LabelsManager from '../LabelsManager/LabelsManager'
import useBoardStore from '../../store/useBoardStore'
import { saveProject, getSavedProjects, deleteSavedProject, updateSavedProjectName } from '../../utils/savedProjects'
import { safeError, safeWarn } from '../../utils/logger'
import './Navbar.css'
import '../SavedProjectsSidebar/SavedProjectsSidebar.css'
import '../Header/Header.css'

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
  
  // Estados para board-gerencial (filtros, modais, etc)
  const [showFilters, setShowFilters] = useState(false)
  const [gerencialProjectName, setGerencialProjectName] = useState('')
  const [isEditingGerencialName, setIsEditingGerencialName] = useState(false)
  
  // Estados para board (filtros, labels, compartilhar, etc)
  const [showBoardFilters, setShowBoardFilters] = useState(false)
  const [showBoardLabelsManager, setShowBoardLabelsManager] = useState(false)
  const [showBoardShareModal, setShowBoardShareModal] = useState(false)
  const [boardProjectName, setBoardProjectName] = useState('')
  const [isEditingBoardName, setIsEditingBoardName] = useState(false)
  const [boardAccessCode, setBoardAccessCode] = useState(null)
  const [boardLoadingCodes, setBoardLoadingCodes] = useState(false)
  const [boardCopied, setBoardCopied] = useState(false)
  
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  
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
      safeWarn('Não foi possível ler o estado da sidebar', error)
      return false
    }
  }
  const [showSavedProjects, setShowSavedProjects] = useState(getInitialSidebarState)
  const [showHomeSidebar, setShowHomeSidebar] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isSearchClosing, setIsSearchClosing] = useState(false)
  const searchInputRef = useRef(null)

  const handleCloseSearch = () => {
    setIsSearchClosing(true)
    setTimeout(() => {
      setIsSearchExpanded(false)
      setIsSearchClosing(false)
    }, 300) // Tempo da animação
  }

  // Focar o input quando a barra expandir
  useEffect(() => {
    if (isSearchExpanded && isHome && !isMobile) {
      // Pequeno delay para garantir que o input esteja renderizado
      const timeout = setTimeout(() => {
        const input = document.querySelector('.navbar-search-wrapper .search-bar-input')
        if (input) {
          input.focus()
        }
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [isSearchExpanded, isHome, isMobile])

  // Fechar a barra de pesquisa ao clicar fora quando não houver dropdown
  useEffect(() => {
    if (isSearchExpanded && isHome && !isMobile) {
      const handleClickOutside = (event) => {
        const searchWrapper = document.querySelector('.navbar-search-wrapper')
        const dropdown = document.querySelector('.navbar-search-wrapper .search-bar-dropdown')
        
        if (searchWrapper && !searchWrapper.contains(event.target)) {
          // Se não houver dropdown visível, fechar a barra
          if (!dropdown || !dropdown.offsetParent) {
            handleCloseSearch()
          }
        }
      }

      // Delay para não fechar imediatamente ao clicar no botão
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isSearchExpanded, isHome, isMobile])

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
          safeError('Erro ao buscar informações do projeto', error)
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
      safeError('Erro ao buscar código de compartilhamento', error)
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
        safeError('Erro ao copiar código', error)
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
        safeError('Erro ao copiar código', error)
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
            safeWarn('Erro ao atualizar projeto', error)
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
      safeError('Erro ao salvar projeto', error)
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
      safeError('Erro ao carregar projeto', error)
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
      safeError('Erro ao deletar projeto', error)
    }
  }

  // Carregar projetos salvos quando o menu mobile do board-gerencial abrir
  useEffect(() => {
    if (isMobileMenuOpen && isBoardGerencial && boardId) {
      loadSavedProjects()
    }
  }, [isMobileMenuOpen, isBoardGerencial, boardId])

  // Carregar dados do projeto gerencial
  useEffect(() => {
    if (isBoardGerencial && boardId) {
      const loadGerencialProject = async () => {
        try {
          const data = await getProject(boardId)
          setGerencialProjectName(data.name || 'Projeto Gerencial')
          updateBoard(boardId, {
            name: data.name || 'Projeto Gerencial'
          })
        } catch (error) {
          console.error('Erro ao carregar projeto gerencial:', error)
        }
      }
      loadGerencialProject()
    }
  }, [isBoardGerencial, boardId, updateBoard])

  // Sincronizar nome do projeto gerencial com o store
  useEffect(() => {
    if (isBoardGerencial && boardId) {
      const currentBoard = boards[boardId] || getBoard(boardId)
      if (currentBoard?.name && currentBoard.name !== gerencialProjectName && !isEditingGerencialName) {
        setGerencialProjectName(currentBoard.name)
      }
    }
  }, [isBoardGerencial, boardId, boards, getBoard, gerencialProjectName, isEditingGerencialName])

  // Carregar dados do projeto board
  useEffect(() => {
    if (isBoard && boardId) {
      const loadBoardProject = async () => {
        try {
          const data = await getProject(boardId)
          setBoardProjectName(data.name || 'Novo Projeto')
          updateBoard(boardId, {
            name: data.name || 'Novo Projeto'
          })
        } catch (error) {
          safeError('Erro ao carregar projeto board', error)
        }
      }
      loadBoardProject()
    }
  }, [isBoard, boardId, updateBoard])

  // Sincronizar nome do projeto board com o store
  useEffect(() => {
    if (isBoard && boardId) {
      const currentBoard = boards[boardId] || getBoard(boardId)
      if (currentBoard?.name && currentBoard.name !== boardProjectName && !isEditingBoardName) {
        setBoardProjectName(currentBoard.name)
      }
    }
  }, [isBoard, boardId, boards, getBoard, boardProjectName, isEditingBoardName])

  // Atualizar título da aba quando o nome mudar
  useEffect(() => {
    if (isBoardGerencial && gerencialProjectName) {
      document.title = `${gerencialProjectName} - @kardiosoftware`
    } else if (isBoard && boardProjectName) {
      document.title = `${boardProjectName} - @kardiosoftware`
    }
    return () => {
      if (isBoardGerencial || isBoard) {
        document.title = '@kardiosoftware'
      }
    }
  }, [isBoardGerencial, gerencialProjectName, isBoard, boardProjectName])




  // Handlers para board-gerencial
  const handleGerencialNameEdit = async (newName) => {
    if (!newName.trim() || !boardId) return
    
    setIsEditingGerencialName(false)
    const previousName = gerencialProjectName
    const trimmedName = newName.trim()
    
    setGerencialProjectName(trimmedName)
    updateBoard(boardId, { name: trimmedName })
    
    try {
      await updateProjectName(boardId, trimmedName)
      document.title = `${trimmedName} - @kardiosoftware`
    } catch (error) {
      console.error('Erro ao atualizar nome do projeto:', error)
      setGerencialProjectName(previousName)
      updateBoard(boardId, { name: previousName })
    }
  }

  const handleLinkProject = async (e) => {
    e.preventDefault()
    if (!linkProjectCode.trim() || !boardId) return

    setIsLinking(true)
    try {
      await linkPersonalProjectToManager(boardId, linkProjectCode.trim().toUpperCase())
      setShowLinkProjectModal(false)
      setLinkProjectCode('')
      window.dispatchEvent(new CustomEvent('manager-link-changed'))
    } catch (error) {
      safeError('Erro ao vincular projeto', error)
    } finally {
      setIsLinking(false)
    }
  }

  const handleCloseLinkProjectModal = () => {
    setShowLinkProjectModal(false)
    setLinkProjectCode('')
  }

  // Handlers para board
  const handleBoardNameEdit = async (newName) => {
    if (!newName.trim() || !boardId) return
    
    setIsEditingBoardName(false)
    const previousName = boardProjectName
    const trimmedName = newName.trim()
    
    setBoardProjectName(trimmedName)
    updateBoard(boardId, { name: trimmedName })
    
    try {
      await updateProjectName(boardId, trimmedName)
      document.title = `${trimmedName} - @kardiosoftware`
    } catch (error) {
      console.error('Erro ao atualizar nome do projeto:', error)
      setBoardProjectName(previousName)
      updateBoard(boardId, { name: previousName })
    }
  }

  const handleBoardShowShare = async () => {
    setShowBoardShareModal(true)
    setBoardLoadingCodes(true)
    
    try {
      const projectData = await getProject(boardId)
      setBoardAccessCode(projectData.accessCode)
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error)
    } finally {
      setBoardLoadingCodes(false)
    }
  }

  const handleBoardCopyAccessCode = async () => {
    if (boardAccessCode) {
      try {
        await navigator.clipboard.writeText(boardAccessCode)
        setBoardCopied(true)
        setTimeout(() => setBoardCopied(false), 2000)
      } catch (error) {
        safeError('Erro ao copiar código', error)
      }
    }
  }

  const handleCloseBoardShareModal = () => {
    setShowBoardShareModal(false)
    setBoardAccessCode(null)
    setBoardCopied(false)
  }

  const handleSaveProject = () => {
    if (projectCode && boardId) {
      setShowSaveProjectModal(true)
    } else {
      alert('Erro ao obter informações do projeto. Tente novamente.')
    }
  }

  const handleSearch = (searchValue) => {
    // Função para pesquisa - pode ser expandida no futuro
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
        safeWarn('Não foi possível salvar o estado da sidebar', error)
      }
    }
  }, [showSavedProjects, isBoard])


  // Navbar simplificada para /board, /board-gerencial e /docs
  if (isBoard || isBoardGerencial || isDocs) {
    // Preparar items do breadcrumb
    const breadcrumbItems = [
      { label: 'Home', href: '/home' },
      { label: isDocs ? 'Docs' : isBoardGerencial ? 'Board Gerencial' : 'Board' }
    ]
    
    // Se for board-gerencial, adicionar o nome do projeto como item editável
    if (isBoardGerencial && gerencialProjectName) {
      breadcrumbItems.push({ label: gerencialProjectName })
    }
    
    // Se for board, adicionar o nome do projeto como item editável
    if (isBoard && boardProjectName) {
      breadcrumbItems.push({ label: boardProjectName })
    }
    
    return (
      <>
        {isCreating && <Loading />}
        {isExiting && <Loading message="Saindo do projeto..." />}
        {/* Modais para board - renderizados antes da navbar para garantir que apareçam */}
        {isBoard && showBoardFilters && boardId && (
          <ModalFilters
            key="board-filters-modal"
            boardId={boardId}
            onClose={() => {
              setShowBoardFilters(false)
            }}
          />
        )}
        {isBoard && showBoardLabelsManager && boardId && (
          <LabelsManager
            key="board-labels-manager-modal"
            boardId={boardId}
            showToast={null}
            onClose={() => {
              setShowBoardLabelsManager(false)
            }}
          />
        )}
        {isBoard && showBoardShareModal && boardId && createPortal(
          <div className="share-modal-overlay" onClick={handleCloseBoardShareModal}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <h2>Compartilhar Projeto</h2>
                <button className="share-modal-close" onClick={handleCloseBoardShareModal}>
                  ×
                </button>
              </div>
              <div className="share-modal-content">
                <p className="share-modal-label">Código de Acesso:</p>
                {boardLoadingCodes ? (
                  <div className="share-modal-loading">Carregando...</div>
                ) : boardAccessCode ? (
                  <div className="share-modal-code-container">
                    <button
                      className="share-modal-code"
                      onClick={handleBoardCopyAccessCode}
                      title="Clique para copiar"
                    >
                      {boardAccessCode}
                    </button>
                    <button
                      className="share-modal-copy-button"
                      onClick={handleBoardCopyAccessCode}
                      title="Copiar código"
                    >
                      {boardCopied ? (
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
                <p className="share-modal-hint">
                  Compartilhe este código para que outras pessoas possam acessar o projeto
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
        {/* Modais para board-gerencial - renderizados antes da navbar para garantir que apareçam */}
        {isBoardGerencial && showFilters && boardId && (
          <ModalFiltersGerencial
            key="board-gerencial-filters-modal"
            boardId={boardId}
            onClose={() => setShowFilters(false)}
          />
        )}
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
                <p className="share-modal-hint">
                  Compartilhe este código para que outras pessoas possam acessar o projeto
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
        <nav className="navbar navbar-fixed">
          <div className="navbar-container">
            <div className="navbar-breadcrumb-wrapper">
              <Breadcrumb
                items={breadcrumbItems}
                onNavigate={isDocs ? (href) => navigate(href) : handleExitClick}
                editableItem={
                  isBoardGerencial && gerencialProjectName 
                    ? { index: 2, label: gerencialProjectName }
                    : isBoard && boardProjectName
                    ? { index: 2, label: boardProjectName }
                    : null
                }
                onEdit={
                  isBoardGerencial 
                    ? handleGerencialNameEdit 
                    : isBoard
                    ? handleBoardNameEdit
                    : null
                }
              />
            </div>
            {!isMobile && (
              <div className="navbar-center">
                <SearchBar onSearch={handleSearch} placeholder="Pesquisar..." />
              </div>
            )}
            <div className="navbar-right-actions">
              {/* Botões do header para board */}
              {isBoard && !isMobile && (
                <div className="navbar-board-actions">
                  <button
                    className="navbar-board-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowBoardFilters(true)
                    }}
                    title="Filtrar cards"
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
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </button>
                  <button
                    className="navbar-board-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowBoardLabelsManager(true)
                    }}
                    title="Gerenciar legendas"
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
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </button>
                  <button
                    className="navbar-board-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleBoardShowShare()
                    }}
                    title="Compartilhar projeto"
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
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    </svg>
                  </button>
                </div>
              )}
              {/* Botões do header para board-gerencial */}
              {isBoardGerencial && !isMobile && (
                <div className="navbar-gerencial-actions">
                  <button
                    className="navbar-gerencial-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowFilters(true)
                    }}
                    title="Filtrar cards"
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
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </button>
                  <button
                    className="navbar-gerencial-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleShowAccessCode()
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
                  </button>
                  <button
                    className="navbar-gerencial-button"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleShowShareCode()
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
                  </button>
                </div>
              )}
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
        {/* Modais duplicados removidos - já renderizados no início do Fragment */}
        {/* {isBoardGerencial && boardId && showAccessCodeModal && createPortal(
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
        )} */}
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
            ) : isHome ? (
              <>
                <div 
                  className={`navbar-search-wrapper ${isSearchExpanded ? 'navbar-search-expanded' : ''} ${isSearchClosing ? 'navbar-search-closing' : ''}`}
                  style={{ minWidth: isSearchExpanded ? '300px' : 'auto', maxWidth: isSearchExpanded ? '400px' : 'none' }}
                >
                  {!isSearchExpanded && !isSearchClosing ? (
                    <button
                      className="navbar-search-icon-button"
                      onClick={() => setIsSearchExpanded(true)}
                      aria-label="Expandir pesquisa"
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
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </button>
                  ) : (
                    <div className={`navbar-search-expanded-wrapper ${isSearchClosing ? 'navbar-search-closing' : ''}`}>
                      <SearchBar 
                        onSearch={handleSearch} 
                        placeholder="Acessar projetos..." 
                      />
                      <button
                        className="navbar-search-close-button"
                        onClick={handleCloseSearch}
                        aria-label="Fechar pesquisa"
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
                  )}
                  {isSearchClosing && (
                    <button
                      className="navbar-search-icon-button navbar-search-icon-button-emerging"
                      onClick={() => {
                        setIsSearchExpanded(false)
                        setIsSearchClosing(false)
                      }}
                      aria-label="Expandir pesquisa"
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
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  className="navbar-mobile-toggle navbar-home-toggle"
                  onClick={() => setShowHomeSidebar(true)}
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
              </>
            ) : (
              <div className="navbar-links">
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
                {!isMobile && <ThemeToggle />}
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
      {showHomeSidebar && isHome && !isMobile && (
        <>
          <div 
            className="share-modal-overlay" 
            style={{ zIndex: 199 }}
            onClick={() => setShowHomeSidebar(false)}
          />
          <div 
            className="saved-projects-sidebar saved-projects-sidebar-open" 
            style={{ 
              zIndex: 200,
              top: 0,
              height: '100vh'
            }}
          >
            <div className="saved-projects-header">
              <h3 className="saved-projects-title">Menu</h3>
              <button
                className="saved-projects-close"
                onClick={() => setShowHomeSidebar(false)}
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
            <div className="saved-projects-actions" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="saved-projects-theme">
                  <ThemeToggle />
                </div>
                <button
                  className="saved-projects-copy-button"
                  onClick={() => {
                    setShowHomeSidebar(false)
                    setShowAccessModal(true)
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" x2="3" y1="12" y2="12"></line>
                  </svg>
                  Entrar no Projeto
                </button>
                <button
                  className="saved-projects-copy-button"
                  onClick={async () => {
                    setShowHomeSidebar(false)
                    await handleStartProject()
                  }}
                  disabled={isCreating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                  {isCreating ? 'Criando...' : 'Criar Projeto'}
                </button>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  className="saved-projects-copy-button"
                  onClick={() => {
                    setShowHomeSidebar(false)
                    localStorage.setItem('kardio-docs-show-overview', 'true')
                    navigate('/docs')
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" x2="8" y1="13" y2="13"></line>
                    <line x1="16" x2="8" y1="17" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Últimos Commits
                </button>
                <button
                  className="saved-projects-copy-button"
                  onClick={() => {
                    setShowHomeSidebar(false)
                    navigate('/docs')
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                  </svg>
                  Docs
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
    </>
  )
}

export default Navbar

