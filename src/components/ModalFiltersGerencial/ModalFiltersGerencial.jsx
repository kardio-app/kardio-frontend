import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getLinkedProjects, getBoard } from '../../services/api'
import useBoardStore from '../../store/useBoardStore'
import './ModalFiltersGerencial.css'

function ModalFiltersGerencial({ boardId, onClose }) {
  const [linkedProjects, setLinkedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive', 'with-pending'
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month'
  
  const boards = useBoardStore((state) => state.boards)
  const getBoardFromStore = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  
  // Carregar projetos vinculados
  useEffect(() => {
    const loadProjects = async () => {
      if (!boardId) return
      
      try {
        setLoading(true)
        const projects = await getLinkedProjects(boardId)
        setLinkedProjects(projects || [])
        
        // Carregar dados dos boards para cada projeto
        for (const project of projects || []) {
          try {
            const boardData = await getBoard(project.encrypted_id)
            // Atualizar o store com os dados do board
            updateBoard(project.encrypted_id, {
              id: boardData.id,
              name: boardData.name,
              columns: boardData.columns || [],
              labels: boardData.labels || []
            })
          } catch (error) {
            console.error(`Erro ao carregar board do projeto ${project.encrypted_id}:`, error)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar projetos vinculados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [boardId, updateBoard])
  
  // Carregar filtros salvos do localStorage
  useEffect(() => {
    if (!boardId) return
    
    try {
      const savedFilters = localStorage.getItem(`board-gerencial-filters-${boardId}`)
      if (savedFilters) {
        const filters = JSON.parse(savedFilters)
        setSelectedProjects(filters.selectedProjects || [])
        setStatusFilter(filters.statusFilter || 'all')
        setDateFilter(filters.dateFilter || 'all')
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error)
    }
  }, [boardId])
  
  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }
  
  const handleApplyFilters = () => {
    if (!boardId) {
      onClose()
      return
    }
    
    const filters = {
      selectedProjects,
      statusFilter,
      dateFilter
    }
    
    // Salvar filtros no localStorage
    try {
      localStorage.setItem(`board-gerencial-filters-${boardId}`, JSON.stringify(filters))
    } catch (error) {
      console.error('Erro ao salvar filtros:', error)
    }
    
    // Disparar evento para que o BoardGerencial aplique os filtros
    window.dispatchEvent(new CustomEvent('gerencial-filters-applied', { detail: filters }))
    
    onClose()
  }
  
  const handleClearFilters = () => {
    setSelectedProjects([])
    setStatusFilter('all')
    setDateFilter('all')
    
    if (boardId) {
      try {
        localStorage.removeItem(`board-gerencial-filters-${boardId}`)
      } catch (error) {
        console.error('Erro ao limpar filtros:', error)
      }
      
      window.dispatchEvent(new CustomEvent('gerencial-filters-applied', { 
        detail: { selectedProjects: [], statusFilter: 'all', dateFilter: 'all' }
      }))
    }
  }
  
  const hasActiveFilters = selectedProjects.length > 0 || 
                           statusFilter !== 'all' || 
                           dateFilter !== 'all'
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  // Calcular estatísticas dos projetos
  const getProjectStats = (projectId) => {
    const board = boards[projectId] || getBoardFromStore(projectId)
    if (!board || !board.columns) return { total: 0, completed: 0, pending: 0 }
    
    const allCards = board.columns.flatMap(col => col.cards || [])
    const completed = allCards.filter(card => card.is_completed).length
    const pending = allCards.filter(card => !card.is_completed).length
    
    return {
      total: allCards.length,
      completed,
      pending
    }
  }
  
  return createPortal(
    <div className="modal-filters-gerencial-backdrop" onClick={handleBackdropClick}>
      <div className="modal-filters-gerencial-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-filters-gerencial-header">
          <h2>Filtrar Projetos Vinculados</h2>
          <button 
            className="modal-filters-gerencial-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-filters-gerencial-body">
          {loading ? (
            <div className="modal-filters-gerencial-loading">
              <p>Carregando projetos...</p>
            </div>
          ) : (
            <>
              {/* Filtro por Projetos */}
              <div className="modal-filters-gerencial-section">
                <label className="modal-filters-gerencial-section-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                  Projetos Vinculados
                </label>
                {linkedProjects.length === 0 ? (
                  <p className="modal-filters-gerencial-empty">Nenhum projeto vinculado disponível</p>
                ) : (
                  <div className="modal-filters-gerencial-list">
                    {linkedProjects.map((project) => {
                      const isSelected = selectedProjects.includes(project.encrypted_id)
                      const stats = getProjectStats(project.encrypted_id)
                      
                      return (
                        <button
                          key={project.id}
                          className={`modal-filters-gerencial-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleProjectToggle(project.encrypted_id)}
                        >
                          <div className="modal-filters-gerencial-item-content">
                            <span className="modal-filters-gerencial-item-name">{project.name}</span>
                            <span className="modal-filters-gerencial-item-stats">
                              {stats.total} cards ({stats.pending} pendentes)
                            </span>
                          </div>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Filtro por Status */}
              <div className="modal-filters-gerencial-section">
                <label className="modal-filters-gerencial-section-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Status
                </label>
                <div className="modal-filters-gerencial-radio-group">
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="statusFilter"
                      value="all"
                      checked={statusFilter === 'all'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <span>Todos</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="statusFilter"
                      value="active"
                      checked={statusFilter === 'active'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <span>Ativos (com atividade recente)</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="statusFilter"
                      value="with-pending"
                      checked={statusFilter === 'with-pending'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <span>Com cards pendentes</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="statusFilter"
                      value="inactive"
                      checked={statusFilter === 'inactive'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <span>Inativos</span>
                  </label>
                </div>
              </div>
              
              {/* Filtro por Data */}
              <div className="modal-filters-gerencial-section">
                <label className="modal-filters-gerencial-section-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Atividade Recente
                </label>
                <div className="modal-filters-gerencial-radio-group">
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="all"
                      checked={dateFilter === 'all'}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <span>Todos</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="today"
                      checked={dateFilter === 'today'}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <span>Hoje</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="week"
                      checked={dateFilter === 'week'}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <span>Últimos 7 dias</span>
                  </label>
                  <label className="modal-filters-gerencial-radio">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="month"
                      checked={dateFilter === 'month'}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <span>Últimos 30 dias</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="modal-filters-gerencial-footer">
          <button
            className="modal-filters-gerencial-button modal-filters-gerencial-button-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Limpar Filtros
          </button>
          <button
            className="modal-filters-gerencial-button modal-filters-gerencial-button-apply"
            onClick={handleApplyFilters}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalFiltersGerencial
