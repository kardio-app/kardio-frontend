import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { getProject, getLinkedProjects, getBoard, unlinkManagerFromPersonalProject, linkPersonalProjectToManager } from '../../services/api'
import BoardComponent from '../Board/Board'
import useBoardStore from '../../store/useBoardStore'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import { safeError } from '../../utils/logger'
import '../Header/Header.css'
import './BoardGerencial.css'

function BoardGerencial({ encryptedId, projectData, showToast }) {
  const navigate = useNavigate()
  const [linkedProjects, setLinkedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedProjectData, setSelectedProjectData] = useState(null)
  const [boardLoading, setBoardLoading] = useState(false)
  const [copiedProjectId, setCopiedProjectId] = useState(null)
  const [showUnlinkModal, setShowUnlinkModal] = useState(false)
  const [projectToUnlink, setProjectToUnlink] = useState(null)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false)
  const [linkProjectCode, setLinkProjectCode] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [filters, setFilters] = useState({
    selectedProjects: [],
    statusFilter: 'all',
    dateFilter: 'all'
  })
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)

  const loadLinkedProjects = useCallback(async () => {
    if (!encryptedId) return
    
    try {
      const projects = await getLinkedProjects(encryptedId)
      setLinkedProjects(projects || [])
      return projects || []
    } catch (error) {
      safeError('Erro ao carregar projetos vinculados', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [encryptedId])

  useEffect(() => {
    loadLinkedProjects()
  }, [loadLinkedProjects])

  // Atualizar projetos vinculados periodicamente
  useEffect(() => {
    if (!encryptedId) return
    
    const interval = setInterval(() => {
      loadLinkedProjects()
    }, 5000) // Atualizar a cada 5 segundos

    return () => clearInterval(interval)
  }, [encryptedId, loadLinkedProjects])

  // Escutar eventos de atualização quando um projeto pessoal vincula/desvincula um gestor
  useEffect(() => {
    if (!encryptedId) return
    
    const handleManagerLinkChange = async () => {
      // Pequeno delay para garantir que o backend processou a mudança
      setTimeout(async () => {
        await loadLinkedProjects()
      }, 500)
    }

    window.addEventListener('manager-link-changed', handleManagerLinkChange)
    
    return () => {
      window.removeEventListener('manager-link-changed', handleManagerLinkChange)
    }
  }, [encryptedId, loadLinkedProjects])

  // Filtrar projetos vinculados baseado nos filtros aplicados
  const filteredLinkedProjects = linkedProjects.filter(project => {
    // Filtro por projetos selecionados
    if (filters.selectedProjects.length > 0) {
      if (!filters.selectedProjects.includes(project.encrypted_id)) {
        return false
      }
    }
    
    // Filtro por status
    const board = boards[project.encrypted_id] || getBoard(project.encrypted_id)
    const allCards = board?.columns?.flatMap(col => col.cards || []) || []
    const hasPendingCards = allCards.some(card => !card.is_completed)
    
    if (filters.statusFilter === 'with-pending' && !hasPendingCards) {
      return false
    }
    
    if (filters.statusFilter === 'active' || filters.statusFilter === 'inactive') {
      // Para determinar atividade, verificamos se há cards atualizados recentemente
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const hasRecentActivity = allCards.some(card => {
        if (!card.updated_at) return false
        const updatedAt = new Date(card.updated_at)
        return updatedAt >= weekAgo
      })
      
      if (filters.statusFilter === 'active' && !hasRecentActivity) {
        return false
      }
      
      if (filters.statusFilter === 'inactive' && hasRecentActivity) {
        return false
      }
    }
    
    // Filtro por data
    if (filters.dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setDate(now.getDate() - 30)
          break
        default:
          break
      }
      
      const hasRecentActivity = allCards.some(card => {
        if (!card.updated_at) return false
        const updatedAt = new Date(card.updated_at)
        return updatedAt >= filterDate
      })
      
      if (!hasRecentActivity) {
        return false
      }
    }
    
    return true
  })
  
  // Verificar se o projeto selecionado ainda está na lista de projetos vinculados
  // Se não estiver, fechar o preview automaticamente
  useEffect(() => {
    if (selectedProjectId && linkedProjects.length > 0) {
      const projectStillLinked = linkedProjects.some(p => p.encrypted_id === selectedProjectId)
      
      if (!projectStillLinked) {
        // Projeto foi desvinculado, limpar preview
        setSelectedProjectId(null)
        setSelectedProjectData(null)
      }
    }
  }, [linkedProjects, selectedProjectId])

  const maskAccessCode = (code) => {
    if (!code || code.length < 2) return '**'
    return code.substring(0, 2) + '*'.repeat(Math.max(0, code.length - 2))
  }

  const handleShareProject = async (e, project) => {
    e.stopPropagation() // Prevenir que o clique abra o projeto
    
    try {
      // Copiar código de acesso para a área de transferência
      await navigator.clipboard.writeText(project.access_code)
      setCopiedProjectId(project.id)
      if (showToast) {
        showToast('Código de acesso copiado!', 'success')
      }
      
      // Resetar estado após 2 segundos
      setTimeout(() => {
        setCopiedProjectId(null)
      }, 2000)
    } catch (error) {
      safeError('Erro ao copiar código', error)
      if (showToast) {
        showToast('Erro ao copiar código', 'error')
      }
    }
  }

  const handleUnlinkProject = (e, project) => {
    e.stopPropagation() // Prevenir que o clique abra o projeto
    setProjectToUnlink(project)
    setShowUnlinkModal(true)
  }

  const handleConfirmUnlink = async () => {
    if (!projectToUnlink || !encryptedId) {
      setShowUnlinkModal(false)
      setProjectToUnlink(null)
      return
    }

    setIsUnlinking(true)
    try {
      // Desvincular projeto pessoal do projeto gerencial
      // projectToUnlink.encrypted_id é o projeto pessoal
      // encryptedId é o projeto gerencial atual
      await unlinkManagerFromPersonalProject(projectToUnlink.encrypted_id, encryptedId)
      
      // Recarregar lista de projetos vinculados
      await loadLinkedProjects()
      
      // Se o projeto desvinculado estava sendo visualizado, fechar o preview
      if (selectedProjectId === projectToUnlink.encrypted_id) {
        setSelectedProjectId(null)
        setSelectedProjectData(null)
      }
      
      // Disparar evento para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('manager-link-changed'))
      
      if (showToast) {
        showToast('Projeto desvinculado com sucesso', 'success')
      }
    } catch (error) {
      console.error('Erro ao desvincular projeto:', error)
      if (showToast) {
        showToast('Erro ao desvincular projeto: ' + error.message, 'error')
      }
    } finally {
      setIsUnlinking(false)
      setShowUnlinkModal(false)
      setProjectToUnlink(null)
    }
  }

  const handleCancelUnlink = () => {
    setShowUnlinkModal(false)
    setProjectToUnlink(null)
  }

  const handleLinkProject = async (e) => {
    e.preventDefault()
    if (!linkProjectCode.trim() || !encryptedId) return

    setIsLinking(true)
    try {
      await linkPersonalProjectToManager(encryptedId, linkProjectCode.trim().toUpperCase())
      setShowLinkProjectModal(false)
      setLinkProjectCode('')
      await loadLinkedProjects()
      window.dispatchEvent(new CustomEvent('manager-link-changed'))
      if (showToast) {
        showToast('Projeto vinculado com sucesso', 'success')
      }
    } catch (error) {
      safeError('Erro ao vincular projeto', error)
      if (showToast) {
        showToast(error.message || 'Erro ao vincular projeto', 'error')
      }
    } finally {
      setIsLinking(false)
    }
  }

  const handleCloseLinkProjectModal = () => {
    setShowLinkProjectModal(false)
    setLinkProjectCode('')
  }

  const loadSelectedProjectBoard = useCallback(async (projectEncryptedId, silent = false) => {
    if (!projectEncryptedId) return
    
    try {
      if (!silent) {
        setBoardLoading(true)
      }
      
      // Carregar dados do board do backend
      const boardData = await getBoard(projectEncryptedId)
      
      // Atualizar o store com os dados mais recentes
      updateBoard(projectEncryptedId, {
        id: boardData.id,
        name: boardData.name,
        columns: boardData.columns || [],
        labels: boardData.labels || []
      })
      
      // Atualizar nome do projeto se mudou (de forma assíncrona para não bloquear)
      getProject(projectEncryptedId).then(projectData => {
        setSelectedProjectData(prev => {
          if (!prev || prev.name !== projectData.name) {
            return projectData
          }
          return prev
        })
      }).catch(err => {
        console.error('Erro ao atualizar dados do projeto:', err)
      })
    } catch (error) {
      console.error('Erro ao carregar board do projeto:', error)
      if (!silent) {
        alert('Erro ao carregar projeto: ' + error.message)
      }
    } finally {
      if (!silent) {
        setBoardLoading(false)
      }
    }
  }, [updateBoard])

  const handleOpenProject = async (projectEncryptedId) => {
    setSelectedProjectId(projectEncryptedId)
    
    try {
      // Carregar dados do projeto
      const projectData = await getProject(projectEncryptedId)
      setSelectedProjectData(projectData)
      
      // Carregar dados do board
      await loadSelectedProjectBoard(projectEncryptedId, false)
      
      // Scroll para a seção do board
      setTimeout(() => {
        const boardSection = document.getElementById('board-loaded-section')
        if (boardSection) {
          boardSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      safeError('Erro ao carregar projeto', error)
      alert('Erro ao carregar projeto: ' + error.message)
      setBoardLoading(false)
    }
  }

  // Atualizar board do projeto selecionado periodicamente
  useEffect(() => {
    if (!selectedProjectId) return
    
    // Carregar imediatamente
    loadSelectedProjectBoard(selectedProjectId, true)
    
    // Atualizar periodicamente a cada 3 segundos
    const interval = setInterval(() => {
      loadSelectedProjectBoard(selectedProjectId, true)
    }, 3000) // Atualizar a cada 3 segundos

    return () => clearInterval(interval)
  }, [selectedProjectId, loadSelectedProjectBoard])

  return (
    <div className="board-gerencial-wrapper">
      {/* Sidebar fixa à esquerda com projetos vinculados */}
      <div className="board-gerencial-sidebar">
        <div className="board-gerencial-sidebar-header">
          <h2 className="board-gerencial-sidebar-title">Projetos Vinculados</h2>
        </div>
        <div className="board-gerencial-sidebar-content">
          {loading ? (
            <div className="board-gerencial-sidebar-loading">
              <p>Carregando projetos...</p>
            </div>
          ) : linkedProjects.length === 0 ? (
            <div className="board-gerencial-sidebar-empty">
              <p>Nenhum projeto vinculado ainda.</p>
              <p className="board-gerencial-sidebar-empty-hint">
                Compartilhe seu código de vinculação com o usuário final para que ele o vincule como seu gestor.
              </p>
            </div>
          ) : filteredLinkedProjects.length === 0 ? (
            <div className="board-gerencial-sidebar-empty">
              <p>Nenhum projeto corresponde aos filtros aplicados.</p>
              <p className="board-gerencial-sidebar-empty-hint">
                Tente ajustar os filtros para ver mais projetos.
              </p>
            </div>
          ) : (
            <div className="board-gerencial-sidebar-projects">
              {filteredLinkedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`board-gerencial-sidebar-project ${selectedProjectId === project.encrypted_id ? 'board-gerencial-sidebar-project-selected' : ''}`}
                  onClick={() => handleOpenProject(project.encrypted_id)}
                >
                  <div className="board-gerencial-sidebar-project-header">
                    <h3 className="board-gerencial-sidebar-project-name" title={project.name}>
                      {project.name}
                    </h3>
                    <div className="board-gerencial-sidebar-project-actions">
                      <button
                        className="board-gerencial-sidebar-project-share"
                        onClick={(e) => handleShareProject(e, project)}
                        title="Compartilhar código de acesso"
                        aria-label="Compartilhar código de acesso"
                      >
                        {copiedProjectId === project.id ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        )}
                      </button>
                      <button
                        className="board-gerencial-sidebar-project-unlink"
                        onClick={(e) => handleUnlinkProject(e, project)}
                        title="Desvincular projeto"
                        aria-label="Desvincular projeto"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="board-gerencial-sidebar-project-code">Código: {maskAccessCode(project.access_code)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Botão para adicionar projeto vinculado na parte inferior da sidebar */}
        <div className="board-gerencial-sidebar-footer">
          <button
            className="board-gerencial-sidebar-add-button"
            onClick={() => setShowLinkProjectModal(true)}
            title="Adicionar projeto vinculado"
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Adicionar Projeto</span>
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="board-gerencial-main">
        {/* Seção para carregar o board do projeto selecionado */}
        {selectedProjectId ? (
        <div id="board-loaded-section" className="board-gerencial-loaded-board">
          <div className="board-gerencial-loaded-board-header">
            <h3 className="board-gerencial-loaded-board-title">
              {selectedProjectData?.name || 'Projeto'}
            </h3>
            <button
              className="board-gerencial-loaded-board-close"
              onClick={() => {
                setSelectedProjectId(null)
                setSelectedProjectData(null)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          {boardLoading ? (
            <div className="board-gerencial-loaded-board-loading">
              <p>Carregando projeto...</p>
            </div>
          ) : (
            <>
              {/* Mostrar insights dos filtros se houver filtros aplicados */}
              {(() => {
                if (!selectedProjectId) return null
                const board = boards[selectedProjectId] || getBoard(selectedProjectId)
                const filters = board?.filters
                const hasActiveFilters = filters && (
                  (filters.labels && filters.labels.length > 0) ||
                  (filters.assignees && filters.assignees.length > 0) ||
                  filters.completionStatus !== 'all' ||
                  filters.dateFilter !== 'all'
                )
                
                return hasActiveFilters ? (
                  <div className="board-gerencial-loaded-board-insights">
                    <FilterInsights boardId={selectedProjectId} filters={filters} />
                  </div>
                ) : null
              })()}
              <div className="board-gerencial-loaded-board-content">
                <BoardComponent 
                  boardId={selectedProjectId}
                />
              </div>
            </>
          )}
          </div>
        ) : (
          <div className="board-gerencial-preview">
            <div className="board-gerencial-preview-content">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="board-gerencial-preview-icon"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <h3 className="board-gerencial-preview-title">
                Selecione um projeto vinculado
              </h3>
              <p className="board-gerencial-preview-description">
                Clique em um projeto da lista à esquerda para visualizar seus cards, colunas e informações detalhadas.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {showUnlinkModal && createPortal(
        <ModalConfirm
          title="Desvincular Projeto?"
          message={`Tem certeza que deseja desvincular o projeto "${projectToUnlink?.name}" deste projeto gerencial? Esta ação irá remover o projeto da lista de projetos vinculados, mas não excluirá o projeto pessoal.`}
          onConfirm={handleConfirmUnlink}
          onCancel={handleCancelUnlink}
          confirmText={isUnlinking ? "Desvinculando..." : "Desvincular"}
          cancelText="Cancelar"
        />,
        document.body
      )}
      
      {/* Modal para adicionar projeto vinculado */}
      {showLinkProjectModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseLinkProjectModal} style={{ zIndex: 10000 }}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Adicionar Projeto Vinculado</h2>
              <button className="share-modal-close" onClick={handleCloseLinkProjectModal}>
                ×
              </button>
            </div>
            <form className="share-modal-content" onSubmit={handleLinkProject}>
              <p className="share-modal-label">Código de Acesso do Projeto Pessoal:</p>
              <input
                type="text"
                className="share-modal-input"
                value={linkProjectCode}
                onChange={(e) => setLinkProjectCode(e.target.value.toUpperCase())}
                placeholder="Digite o código de acesso"
                maxLength={20}
                required
                autoFocus
              />
              <p className="share-modal-hint">
                Insira o código de acesso do projeto pessoal que deseja vincular a este projeto gerencial.
              </p>
              <div className="share-modal-actions">
                <button
                  type="button"
                  className="share-modal-button-cancel"
                  onClick={handleCloseLinkProjectModal}
                  disabled={isLinking}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="share-modal-button-submit"
                  disabled={!linkProjectCode.trim() || isLinking}
                >
                  {isLinking ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default BoardGerencial

