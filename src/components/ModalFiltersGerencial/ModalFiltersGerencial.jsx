import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { safeError } from '../../utils/logger'
import { getLinkedProjects, getBoard } from '../../services/api'
import useBoardStore from '../../store/useBoardStore'
import FilterInsights from '../FilterInsights/FilterInsights'
import './ModalFiltersGerencial.css'

function ModalFiltersGerencial({ boardId, onClose }) {
  const [linkedProjects, setLinkedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive', 'with-pending'
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month'
  
  // Filtros do board do projeto selecionado
  const [selectedProjectBoardId, setSelectedProjectBoardId] = useState(null)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedAssignees, setSelectedAssignees] = useState([])
  const [completionStatus, setCompletionStatus] = useState('all')
  const [boardDateFilter, setBoardDateFilter] = useState('all')
  
  const boards = useBoardStore((state) => state.boards)
  const getBoardFromStore = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  
  // Ref para rastrear o último projeto selecionado e evitar resets desnecessários
  const lastSelectedProjectRef = useRef(null)
  const filtersInitializedRef = useRef(false)
  
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
            safeError(`Erro ao carregar board do projeto ${project.encrypted_id}:`, error)
          }
        }
      } catch (error) {
        safeError('Erro ao carregar projetos vinculados', error)
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
      safeError('Erro ao carregar filtros salvos:', error)
    }
  }, [boardId])
  
  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }
  
  // Quando um projeto é selecionado, carregar seus filtros (apenas quando o projeto muda)
  useEffect(() => {
    if (selectedProjects.length === 1) {
      const projectId = selectedProjects[0]
      // Só atualizar se o projeto realmente mudou
      if (lastSelectedProjectRef.current !== projectId) {
        lastSelectedProjectRef.current = projectId
        filtersInitializedRef.current = false
        setSelectedProjectBoardId(projectId)
        const board = boards[projectId] || getBoardFromStore(projectId)
        if (board?.filters) {
          setSelectedLabels(board.filters.labels || [])
          setSelectedAssignees(board.filters.assignees || [])
          setCompletionStatus(board.filters.completionStatus || 'all')
          setBoardDateFilter(board.filters.dateFilter || 'all')
        } else {
          setSelectedLabels([])
          setSelectedAssignees([])
          setCompletionStatus('all')
          setBoardDateFilter('all')
        }
        filtersInitializedRef.current = true
      }
      // Não resetar os filtros se o projeto não mudou, mesmo que o board seja atualizado
    } else {
      lastSelectedProjectRef.current = null
      filtersInitializedRef.current = false
      setSelectedProjectBoardId(null)
      setSelectedLabels([])
      setSelectedAssignees([])
      setCompletionStatus('all')
      setBoardDateFilter('all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjects])
  
  const handleLabelToggle = (labelId) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }
  
  const handleAssigneeToggle = (assignee) => {
    setSelectedAssignees(prev => 
      prev.includes(assignee) 
        ? prev.filter(a => a !== assignee)
        : [...prev, assignee]
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
    
    // Se houver um projeto selecionado, salvar também os filtros do board
    if (selectedProjectBoardId) {
      const boardFilters = {
        labels: selectedLabels,
        assignees: selectedAssignees,
        completionStatus,
        dateFilter: boardDateFilter
      }
      updateBoard(selectedProjectBoardId, { filters: boardFilters })
    }
    
    // Salvar filtros no localStorage
    try {
      localStorage.setItem(`board-gerencial-filters-${boardId}`, JSON.stringify(filters))
    } catch (error) {
      safeError('Erro ao salvar filtros', error)
    }
    
    // Disparar evento para que o BoardGerencial aplique os filtros
    window.dispatchEvent(new CustomEvent('gerencial-filters-applied', { detail: filters }))
    
    onClose()
  }
  
  const handleClearFilters = () => {
    setSelectedProjects([])
    setStatusFilter('all')
    setDateFilter('all')
    setSelectedProjectBoardId(null)
    setSelectedLabels([])
    setSelectedAssignees([])
    setCompletionStatus('all')
    setBoardDateFilter('all')
    
    if (boardId) {
      try {
        localStorage.removeItem(`board-gerencial-filters-${boardId}`)
      } catch (error) {
        safeError('Erro ao limpar filtros', error)
      }
      
      window.dispatchEvent(new CustomEvent('gerencial-filters-applied', { 
        detail: { selectedProjects: [], statusFilter: 'all', dateFilter: 'all' }
      }))
    }
  }
  
  // Função para determinar a cor do texto com melhor contraste
  const getContrastColor = (hexColor) => {
    if (!hexColor || hexColor.length !== 7) return '#FFFFFF'
    
    const r = parseInt(hexColor.substr(1, 2), 16)
    const g = parseInt(hexColor.substr(3, 2), 16)
    const b = parseInt(hexColor.substr(5, 2), 16)
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }
  
  // Obter dados do board do projeto selecionado
  const selectedProjectBoard = selectedProjectBoardId 
    ? (boards[selectedProjectBoardId] || getBoardFromStore(selectedProjectBoardId))
    : null
  const selectedProjectLabels = selectedProjectBoard?.labels || []
  const selectedProjectColumns = selectedProjectBoard?.columns || []
  
  // Coletar todos os responsáveis únicos dos cards do projeto selecionado
  const allAssignees = Array.from(
    new Set(
      (selectedProjectColumns || [])
        .flatMap(col => col.cards || [])
        .map(card => card.assignee)
        .filter(Boolean)
    )
  ).sort()
  
  // Função para contar cards por legenda
  const getLabelCardCount = (labelId) => {
    if (!selectedProjectColumns) return 0
    const allCards = selectedProjectColumns.flatMap(col => col.cards || [])
    return allCards.filter(card => {
      const cardLabelIds = card.label_ids || []
      return cardLabelIds.includes(labelId)
    }).length
  }
  
  // Função para contar cards por responsável
  const getAssigneeCardCount = (assignee) => {
    if (!selectedProjectColumns) return 0
    const allCards = selectedProjectColumns.flatMap(col => col.cards || [])
    return allCards.filter(card => card.assignee === assignee).length
  }
  
  const hasBoardFilters = selectedLabels.length > 0 || 
                          selectedAssignees.length > 0 || 
                          completionStatus !== 'all' || 
                          boardDateFilter !== 'all'
  
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
      <div className={`modal-filters-gerencial-container ${selectedProjectBoardId ? 'with-board-filters' : ''} ${hasBoardFilters ? 'with-insights' : ''}`} onClick={(e) => e.stopPropagation()}>
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
            disabled={!hasActiveFilters && !hasBoardFilters}
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
      
      {/* Painel de filtros do board do projeto selecionado */}
      {selectedProjectBoardId && selectedProjectBoard && (
        <div className="modal-filters-gerencial-board-panel" onClick={(e) => e.stopPropagation()}>
          <div className="modal-filters-gerencial-board-panel-header">
            <h3>Filtrar Cards - {selectedProjectBoard.name || 'Projeto Selecionado'}</h3>
          </div>
          <div className="modal-filters-gerencial-board-panel-body">
            {/* Filtro por Legendas */}
            <div className="modal-filters-gerencial-section">
              <label className="modal-filters-gerencial-section-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7h.01"></path>
                  <path d="M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"></path>
                </svg>
                Legendas
              </label>
              {selectedProjectLabels.length === 0 ? (
                <p className="modal-filters-gerencial-empty">Nenhuma legenda disponível</p>
              ) : (
                <div className="modal-filters-gerencial-list">
                  {selectedProjectLabels.map((label) => {
                    const isSelected = selectedLabels.includes(label.id)
                    return (
                      <button
                        key={label.id}
                        className={`modal-filters-gerencial-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleLabelToggle(label.id)}
                        style={{ 
                          backgroundColor: isSelected ? label.color : 'transparent',
                          borderColor: isSelected ? label.color : 'var(--border-color)',
                          color: isSelected ? getContrastColor(label.color) : 'var(--text-white)'
                        }}
                      >
                        <span>{label.name}</span>
                        <span className="modal-filters-gerencial-item-count">
                          ({getLabelCardCount(label.id)})
                        </span>
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
            
            {/* Filtro por Responsável */}
            {allAssignees.length > 0 && (
              <div className="modal-filters-gerencial-section">
                <label className="modal-filters-gerencial-section-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Responsável
                </label>
                <div className="modal-filters-gerencial-list">
                  {allAssignees.map((assignee) => {
                    const isSelected = selectedAssignees.includes(assignee)
                    return (
                      <button
                        key={assignee}
                        className={`modal-filters-gerencial-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAssigneeToggle(assignee)}
                      >
                        <span>{assignee}</span>
                        <span className="modal-filters-gerencial-item-count">
                          ({getAssigneeCardCount(assignee)})
                        </span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
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
                    name="boardCompletionStatus"
                    value="all"
                    checked={completionStatus === 'all'}
                    onChange={(e) => setCompletionStatus(e.target.value)}
                  />
                  <span>Todos</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardCompletionStatus"
                    value="completed"
                    checked={completionStatus === 'completed'}
                    onChange={(e) => setCompletionStatus(e.target.value)}
                  />
                  <span>Concluídos</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardCompletionStatus"
                    value="not-completed"
                    checked={completionStatus === 'not-completed'}
                    onChange={(e) => setCompletionStatus(e.target.value)}
                  />
                  <span>Pendentes</span>
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
                Data de Criação
              </label>
              <div className="modal-filters-gerencial-radio-group">
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardDateFilter"
                    value="all"
                    checked={boardDateFilter === 'all'}
                    onChange={(e) => setBoardDateFilter(e.target.value)}
                  />
                  <span>Todos</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardDateFilter"
                    value="today"
                    checked={boardDateFilter === 'today'}
                    onChange={(e) => setBoardDateFilter(e.target.value)}
                  />
                  <span>Hoje</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardDateFilter"
                    value="week"
                    checked={boardDateFilter === 'week'}
                    onChange={(e) => setBoardDateFilter(e.target.value)}
                  />
                  <span>Últimos 7 dias</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardDateFilter"
                    value="month"
                    checked={boardDateFilter === 'month'}
                    onChange={(e) => setBoardDateFilter(e.target.value)}
                  />
                  <span>Últimos 30 dias</span>
                </label>
                <label className="modal-filters-gerencial-radio">
                  <input
                    type="radio"
                    name="boardDateFilter"
                    value="year"
                    checked={boardDateFilter === 'year'}
                    onChange={(e) => setBoardDateFilter(e.target.value)}
                  />
                  <span>Último ano</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Footer com botões do board */}
          <div className="modal-filters-gerencial-board-panel-footer">
            <button
              className="modal-filters-gerencial-button modal-filters-gerencial-button-clear"
              onClick={() => {
                setSelectedLabels([])
                setSelectedAssignees([])
                setCompletionStatus('all')
                setBoardDateFilter('all')
              }}
              disabled={!hasBoardFilters}
            >
              Limpar Filtros
            </button>
            <button
              className="modal-filters-gerencial-button modal-filters-gerencial-button-apply"
              onClick={() => {
                if (selectedProjectBoardId) {
                  const boardFilters = {
                    labels: selectedLabels,
                    assignees: selectedAssignees,
                    completionStatus,
                    dateFilter: boardDateFilter
                  }
                  updateBoard(selectedProjectBoardId, { filters: boardFilters })
                }
              }}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Painel de insights do board */}
      {hasBoardFilters && selectedProjectBoardId && (
        <div className="modal-filters-gerencial-insights-panel" onClick={(e) => e.stopPropagation()}>
          <div className="modal-filters-gerencial-insights-panel-header">
            <h3>Insights dos Filtros</h3>
          </div>
          <div className="modal-filters-gerencial-insights-panel-body">
            <FilterInsights 
              boardId={selectedProjectBoardId} 
              filters={{
                labels: selectedLabels,
                assignees: selectedAssignees,
                completionStatus,
                dateFilter: boardDateFilter
              }}
            />
          </div>
        </div>
      )}
      </div>
    </div>,
    document.body
  )
}

export default ModalFiltersGerencial
