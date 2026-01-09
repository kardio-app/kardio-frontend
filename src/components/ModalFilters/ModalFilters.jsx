import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import './ModalFilters.css'

function ModalFilters({ boardId, onClose }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  
  const board = boards[boardId] || getBoard(boardId)
  const labels = board.labels || []
  const columns = board.columns || []
  
  // Coletar todos os responsáveis únicos dos cards
  const allAssignees = Array.from(
    new Set(
      columns
        .flatMap(col => col.cards || [])
        .map(card => card.assignee)
        .filter(Boolean)
    )
  ).sort()
  
  // Estados dos filtros
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedAssignees, setSelectedAssignees] = useState([])
  const [completionStatus, setCompletionStatus] = useState('all') // 'all', 'completed', 'not-completed'
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month', 'year'
  
  // Carregar filtros salvos do board
  useEffect(() => {
    const savedFilters = board.filters || {}
    setSelectedLabels(savedFilters.labels || [])
    setSelectedAssignees(savedFilters.assignees || [])
    setCompletionStatus(savedFilters.completionStatus || 'all')
    setDateFilter(savedFilters.dateFilter || 'all')
  }, [board.filters])
  
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
    const filters = {
      labels: selectedLabels,
      assignees: selectedAssignees,
      completionStatus,
      dateFilter
    }
    
    updateBoard(boardId, { filters })
    onClose()
  }
  
  const handleClearFilters = () => {
    setSelectedLabels([])
    setSelectedAssignees([])
    setCompletionStatus('all')
    setDateFilter('all')
    updateBoard(boardId, { filters: null })
  }
  
  const hasActiveFilters = selectedLabels.length > 0 || 
                           selectedAssignees.length > 0 || 
                           completionStatus !== 'all' || 
                           dateFilter !== 'all'
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return createPortal(
    <div className="modal-filters-backdrop" onClick={handleBackdropClick}>
      <div className="modal-filters-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-filters-header">
          <h2>Filtrar Cards</h2>
          <button 
            className="modal-filters-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-filters-body">
          {/* Filtro por Legendas */}
          <div className="modal-filters-section">
            <label className="modal-filters-section-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h.01"></path>
                <path d="M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"></path>
              </svg>
              Legendas
            </label>
            {labels.length === 0 ? (
              <p className="modal-filters-empty">Nenhuma legenda disponível</p>
            ) : (
              <div className="modal-filters-list">
                {labels.map((label) => {
                  const isSelected = selectedLabels.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      className={`modal-filters-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleLabelToggle(label.id)}
                      style={{ 
                        backgroundColor: isSelected ? label.color : 'transparent',
                        borderColor: label.color,
                        color: isSelected ? (getContrastColor(label.color)) : 'var(--text-white)'
                      }}
                    >
                      <span>{label.name}</span>
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
          <div className="modal-filters-section">
            <label className="modal-filters-section-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Responsável
            </label>
            {allAssignees.length === 0 ? (
              <p className="modal-filters-empty">Nenhum responsável encontrado</p>
            ) : (
              <div className="modal-filters-list">
                {allAssignees.map((assignee) => {
                  const isSelected = selectedAssignees.includes(assignee)
                  return (
                    <button
                      key={assignee}
                      className={`modal-filters-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAssigneeToggle(assignee)}
                    >
                      <span>{assignee}</span>
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
          <div className="modal-filters-section">
            <label className="modal-filters-section-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Status
            </label>
            <div className="modal-filters-radio-group">
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="completionStatus"
                  value="all"
                  checked={completionStatus === 'all'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span>Todos</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="completionStatus"
                  value="completed"
                  checked={completionStatus === 'completed'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span>Concluídos</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="completionStatus"
                  value="not-completed"
                  checked={completionStatus === 'not-completed'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span>Pendentes</span>
              </label>
            </div>
          </div>
          
          {/* Filtro por Data */}
          <div className="modal-filters-section">
            <label className="modal-filters-section-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Data de Criação
            </label>
            <div className="modal-filters-radio-group">
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="dateFilter"
                  value="all"
                  checked={dateFilter === 'all'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>Todos</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="dateFilter"
                  value="today"
                  checked={dateFilter === 'today'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>Hoje</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="dateFilter"
                  value="week"
                  checked={dateFilter === 'week'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>Últimos 7 dias</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="dateFilter"
                  value="month"
                  checked={dateFilter === 'month'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>Últimos 30 dias</span>
              </label>
              <label className="modal-filters-radio">
                <input
                  type="radio"
                  name="dateFilter"
                  value="year"
                  checked={dateFilter === 'year'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>Último ano</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-filters-footer">
          <button
            className="modal-filters-button modal-filters-button-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Limpar Filtros
          </button>
          <button
            className="modal-filters-button modal-filters-button-apply"
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

// Função para determinar a cor do texto com melhor contraste
function getContrastColor(hexColor) {
  if (!hexColor || hexColor.length !== 7) return '#FFFFFF'
  
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export default ModalFilters

