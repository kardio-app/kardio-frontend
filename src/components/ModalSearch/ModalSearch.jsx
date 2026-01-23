import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { getSavedProjects, saveProject } from '../../utils/savedProjects'
import { accessProject, getBoard, getProject, createProject } from '../../services/api'
import Loading from '../Loading/Loading'
import ModalAccess from '../ModalAccess/ModalAccess'
import ModalCreateProject from '../ModalCreateProject/ModalCreateProject'
import { safeError } from '../../utils/logger'
import './ModalSearch.css'

const maskCode = (code) => {
  if (!code || code.length < 2) return code
  return code.substring(0, 2) + '****'
}

function ModalSearch({ isOpen, onClose, onSearch }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [boardData, setBoardData] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('recomendados')
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createProjectResult, setCreateProjectResult] = useState(null)
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  const isBoard = location.pathname.startsWith('/board/')
  const loadingMessage = isBoard ? 'Carregando projeto...' : 'Entrando no projeto...'

  useEffect(() => {
    if (isOpen) {
      loadProjects()
      // Focar no input quando o modal abrir
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } else {
      setSearchValue('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const loadProjects = async () => {
    const saved = getSavedProjects()
    setProjects(saved)
    
    if (saved.length > 0) {
      const updatedProjects = await Promise.allSettled(
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
                try {
                  result = await accessProject(project.code)
                } catch (accessError) {
                  throw new Error('Projeto não encontrado')
                }
              }
            } else {
              try {
                result = await accessProject(project.code)
              } catch (accessError) {
                throw new Error('Projeto não encontrado')
              }
            }
            
            if (result.name && result.name !== project.name) {
              saveProject({
                name: result.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink || project.encryptedLink
              })
              return {
                ...project,
                name: result.name,
                encryptedLink: result.encryptedLink || project.encryptedLink
              }
            }
            if (result.encryptedLink && result.encryptedLink !== project.encryptedLink) {
              saveProject({
                name: project.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink
              })
              return {
                ...project,
                encryptedLink: result.encryptedLink
              }
            }
            return project
          } catch (error) {
            return project
          }
        })
      )
      
      const finalProjects = updatedProjects.map(result => 
        result.status === 'fulfilled' ? result.value : saved[updatedProjects.indexOf(result)]
      )
      setProjects(finalProjects)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    setSearchValue('')
    if (onSearch) {
      onSearch('')
    }
  }

  const handleLoadProject = async (project) => {
    setIsLoading(true)
    onClose()
    try {
      const result = await accessProject(project.code)
      setProjectResult(result)
      
      if (result.type !== 'managerial') {
        try {
          const boardData = await getBoard(result.encryptedLink)
          setBoardData(boardData)
        } catch (boardError) {
          safeError('Erro ao pré-carregar board:', boardError)
        }
      } else {
        setBoardData({})
      }
    } catch (error) {
      safeError('Erro ao carregar projeto:', error)
      alert('Erro ao carregar projeto. Verifique o código.')
      setIsLoading(false)
      setProjectResult(null)
      setBoardData(null)
    }
  }

  const handleCreateProject = () => {
    onClose()
    setShowCreateModal(true)
  }

  const handleCreateProjectConfirm = async (projectData) => {
    setShowCreateModal(false)
    setIsCreating(true)
    try {
      const linkedProjects = projectData.linkedProjects || []
      const result = await createProject(projectData.name, projectData.type, linkedProjects)
      setCreateProjectResult(result)
      
      // Salvar automaticamente no localStorage
      try {
        saveProject({
          name: projectData.name,
          code: result.accessCode,
          encryptedLink: result.encryptedLink
        })

        // Salvar também os projetos pessoais vinculados criados
        if (result.linkedProjects && result.linkedProjects.length > 0) {
          result.linkedProjects.forEach(linkedProject => {
            try {
              saveProject({
                name: linkedProject.name,
                code: linkedProject.accessCode,
                encryptedLink: linkedProject.encryptedId
              })
            } catch (saveError) {
              safeError('Erro ao salvar projeto vinculado:', saveError)
            }
          })
        }
      } catch (saveError) {
        safeError('Erro ao salvar projeto automaticamente', saveError)
      }
    } catch (error) {
      safeError('Erro ao criar projeto', error)
      alert('Erro ao criar projeto. Tente novamente.')
      setIsCreating(false)
      setCreateProjectResult(null)
    }
  }

  const handleCreateProjectCancel = () => {
    setShowCreateModal(false)
  }

  useEffect(() => {
    if (isCreating && createProjectResult) {
      const timer = setTimeout(() => {
        if (createProjectResult.type === 'managerial') {
          navigate(`/board-gerencial/${createProjectResult.encryptedLink}`)
        } else {
          navigate(`/board/${createProjectResult.encryptedLink}`)
        }
        setIsCreating(false)
        setCreateProjectResult(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isCreating, createProjectResult, navigate])

  const handleAccessProject = () => {
    onClose()
    // Usar setTimeout para garantir que o ModalSearch feche antes de abrir o ModalAccess
    setTimeout(() => {
      setShowAccessModal(true)
    }, 200)
  }

  useEffect(() => {
    if (isLoading && projectResult && boardData !== undefined) {
      if (boardData && Object.keys(boardData).length > 0) {
        sessionStorage.setItem(`board_preload_${projectResult.encryptedLink}`, JSON.stringify(boardData))
      }
      
      const timer = setTimeout(() => {
        const projectType = projectResult.type || 'personal'
        const route = projectType === 'managerial' 
          ? `/board-gerencial/${projectResult.encryptedLink}`
          : `/board/${projectResult.encryptedLink}`
        
        navigate(route)
        setIsLoading(false)
        setProjectResult(null)
        setBoardData(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isLoading, projectResult, boardData, navigate])

  const filteredProjects = searchValue
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    : projects

  const filterOptions = [
    { 
      id: 'recomendados', 
      label: 'Recomendados', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      )
    },
    { 
      id: 'projetos', 
      label: 'Projetos', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <path d="M9 3v18"></path>
          <path d="M9 12h6"></path>
        </svg>
      )
    },
    { 
      id: 'criar', 
      label: 'Criar Projeto', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      )
    },
    { 
      id: 'acessar', 
      label: 'Acessar Projeto', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    }
  ]

  return (
    <>
      {isLoading && createPortal(
        <Loading message={loadingMessage} />,
        document.body
      )}
      {isCreating && createProjectResult && createPortal(
        <Loading message="Criando novo projeto..." />,
        document.body
      )}
      {showAccessModal && createPortal(
        <ModalAccess onClose={() => setShowAccessModal(false)} />,
        document.body
      )}
      {showCreateModal && createPortal(
        <ModalCreateProject
          onConfirm={handleCreateProjectConfirm}
          onCancel={handleCreateProjectCancel}
        />,
        document.body
      )}
      {isOpen && createPortal(
        <div className="modal-search-overlay" onClick={onClose}>
          <div className="modal-search" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-search-header">
              <div className="modal-search-input-wrapper">
                <svg
                  className="modal-search-icon"
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
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="modal-search-input"
                  placeholder="O que você está buscando?"
                  value={searchValue}
                  onChange={handleChange}
                />
                {searchValue && (
                  <button
                    className="modal-search-clear"
                    onClick={handleClear}
                    aria-label="Limpar pesquisa"
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
                )}
              </div>
            </div>
            <hr className="modal-search-divider" />
            <div className="modal-search-content">
              <div className="modal-search-filters">
                <span className="modal-search-filters-title">Filtrar</span>
                <div className="modal-search-filters-list">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`modal-search-filter-item ${selectedFilter === filter.id ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      <span className="modal-search-filter-icon">{filter.icon}</span>
                      <span className="modal-search-filter-label">{filter.label}</span>
                      {selectedFilter === filter.id && (
                        <svg
                          className="modal-search-filter-arrow"
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-search-results">
                {selectedFilter === 'recomendados' && (
                  <div className="modal-search-section">
                    <h3 className="modal-search-section-title">Projetos Recentes</h3>
                    <div className="modal-search-projects-list">
                      {filteredProjects.slice(0, 5).map((project) => (
                        <div
                          key={project.id}
                          className="modal-search-project-item"
                          onClick={() => handleLoadProject(project)}
                        >
                          <div className="modal-search-project-icon">
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
                          <div className="modal-search-project-info">
                            <p className="modal-search-project-name">{project.name}</p>
                            <p className="modal-search-project-code">Código: {maskCode(project.code)}</p>
                          </div>
                          <svg
                            className="modal-search-project-arrow"
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
                        </div>
                      ))}
                      {filteredProjects.length === 0 && (
                        <div className="modal-search-empty">
                          Nenhum projeto encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedFilter === 'projetos' && (
                  <div className="modal-search-section">
                    <h3 className="modal-search-section-title">Todos os Projetos</h3>
                    <div className="modal-search-projects-list">
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="modal-search-project-item"
                          onClick={() => handleLoadProject(project)}
                        >
                          <div className="modal-search-project-icon">
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
                          <div className="modal-search-project-info">
                            <p className="modal-search-project-name">{project.name}</p>
                            <p className="modal-search-project-code">Código: {maskCode(project.code)}</p>
                          </div>
                          <svg
                            className="modal-search-project-arrow"
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
                        </div>
                      ))}
                      {filteredProjects.length === 0 && (
                        <div className="modal-search-empty">
                          Nenhum projeto salvo ainda
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedFilter === 'criar' && (
                  <div className="modal-search-section">
                    <h3 className="modal-search-section-title">Criar Novo Projeto</h3>
                    <div className="modal-search-actions">
                      <button
                        className="modal-search-action-button"
                        onClick={handleCreateProject}
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
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                        <span>Criar Projeto</span>
                      </button>
                    </div>
                  </div>
                )}
                {selectedFilter === 'acessar' && (
                  <div className="modal-search-section">
                    <h3 className="modal-search-section-title">Acessar Projeto</h3>
                    <div className="modal-search-actions">
                      <button
                        className="modal-search-action-button"
                        onClick={handleAccessProject}
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
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" x2="3" y1="12" y2="12"></line>
                        </svg>
                        <span>Entrar com Código</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default ModalSearch
