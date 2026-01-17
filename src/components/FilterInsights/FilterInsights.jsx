import { useMemo } from 'react'
import useBoardStore from '../../store/useBoardStore'
import './FilterInsights.css'

function FilterInsights({ boardId, filters }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  
  const board = boardId ? (boards[boardId] || getBoard(boardId)) : null
  const columns = board?.columns || []
  const labels = board?.labels || []
  
  // Calcular estatísticas dos filtros
  const insights = useMemo(() => {
    if (!filters || !board) {
      return null
    }
    
    // Coletar todos os cards
    const allCards = columns.flatMap(col => col.cards || [])
    const totalCards = allCards.length
    
    // Aplicar os mesmos filtros que o Column.jsx aplica
    let filteredCards = [...allCards]
    
    // Filtro por legendas
    if (filters.labels && filters.labels.length > 0) {
      filteredCards = filteredCards.filter(card => {
        const cardLabelIds = card.label_ids || []
        return filters.labels.some(labelId => cardLabelIds.includes(labelId))
      })
    }
    
    // Filtro por responsável
    if (filters.assignees && filters.assignees.length > 0) {
      filteredCards = filteredCards.filter(card => 
        card.assignee && filters.assignees.includes(card.assignee)
      )
    }
    
    // Filtro por status de conclusão
    if (filters.completionStatus === 'completed') {
      filteredCards = filteredCards.filter(card => card.is_completed === true)
    } else if (filters.completionStatus === 'not-completed') {
      filteredCards = filteredCards.filter(card => !card.is_completed)
    }
    
    // Filtro por data
    if (filters.dateFilter && filters.dateFilter !== 'all') {
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
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          break
      }
      
      filteredCards = filteredCards.filter(card => {
        if (!card.created_at) return false
        const cardDate = new Date(card.created_at)
        return cardDate >= filterDate
      })
    }
    
    const filteredCount = filteredCards.length
    const hiddenCount = totalCards - filteredCount
    
    // Estatísticas por coluna
    const columnStats = columns.map(col => {
      const colCards = col.cards || []
      const colFilteredCards = colCards.filter(card => {
        // Aplicar os mesmos filtros
        if (filters.labels && filters.labels.length > 0) {
          const cardLabelIds = card.label_ids || []
          if (!filters.labels.some(labelId => cardLabelIds.includes(labelId))) {
            return false
          }
        }
        
        if (filters.assignees && filters.assignees.length > 0) {
          if (!card.assignee || !filters.assignees.includes(card.assignee)) {
            return false
          }
        }
        
        if (filters.completionStatus === 'completed' && !card.is_completed) {
          return false
        }
        if (filters.completionStatus === 'not-completed' && card.is_completed) {
          return false
        }
        
        if (filters.dateFilter && filters.dateFilter !== 'all') {
          if (!card.created_at) return false
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
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1)
              break
          }
          const cardDate = new Date(card.created_at)
          if (cardDate < filterDate) return false
        }
        
        return true
      })
      
      return {
        columnName: col.name || col.title,
        total: colCards.length,
        visible: colFilteredCards.length,
        hidden: colCards.length - colFilteredCards.length
      }
    })
    
    // Estatísticas por responsável
    const assigneeStats = {}
    filteredCards.forEach(card => {
      if (card.assignee) {
        assigneeStats[card.assignee] = (assigneeStats[card.assignee] || 0) + 1
      }
    })
    
    // Estatísticas por legenda
    const labelStats = {}
    filteredCards.forEach(card => {
      const cardLabelIds = card.label_ids || []
      cardLabelIds.forEach(labelId => {
        const label = labels.find(l => l.id === labelId)
        if (label) {
          labelStats[label.name] = (labelStats[label.name] || 0) + 1
        }
      })
    })
    
    // Estatísticas de conclusão
    const completedCount = filteredCards.filter(card => card.is_completed).length
    const pendingCount = filteredCards.filter(card => !card.is_completed).length
    
    return {
      totalCards,
      filteredCount,
      hiddenCount,
      columnStats,
      assigneeStats,
      labelStats,
      completedCount,
      pendingCount
    }
  }, [filters, columns, labels, board])
  
  if (!insights || !filters) {
    return null
  }
  
  const hasActiveFilters = (filters.labels && filters.labels.length > 0) ||
                           (filters.assignees && filters.assignees.length > 0) ||
                           filters.completionStatus !== 'all' ||
                           filters.dateFilter !== 'all'
  
  if (!hasActiveFilters) {
    return null
  }
  
  // Obter nomes das legendas selecionadas
  const selectedLabelNames = filters.labels
    ? filters.labels.map(labelId => {
        const label = labels.find(l => l.id === labelId)
        return label ? label.name : null
      }).filter(Boolean)
    : []
  
  // Obter nomes dos responsáveis selecionados
  const selectedAssigneeNames = filters.assignees || []
  
  // Obter texto do status
  const statusText = filters.completionStatus === 'completed' 
    ? 'Concluídos' 
    : filters.completionStatus === 'not-completed' 
    ? 'Pendentes' 
    : 'Todos'
  
  // Obter texto da data
  const dateText = filters.dateFilter === 'today' 
    ? 'Hoje'
    : filters.dateFilter === 'week'
    ? 'Últimos 7 dias'
    : filters.dateFilter === 'month'
    ? 'Últimos 30 dias'
    : filters.dateFilter === 'year'
    ? 'Último ano'
    : 'Todos'
  
  return (
    <div className="filter-insights">
      <div className="filter-insights-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>Insights dos Filtros</h3>
      </div>
      
      <div className="filter-insights-content">
        {/* Resumo geral */}
        <div className="filter-insights-section">
          <div className="filter-insights-stat">
            <span className="filter-insights-stat-label">Cards visíveis:</span>
            <span className="filter-insights-stat-value">{insights.filteredCount} de {insights.totalCards}</span>
          </div>
          {insights.hiddenCount > 0 && (
            <div className="filter-insights-stat">
              <span className="filter-insights-stat-label">Cards ocultos:</span>
              <span className="filter-insights-stat-value">{insights.hiddenCount}</span>
            </div>
          )}
        </div>
        
        {/* Filtros aplicados */}
        <div className="filter-insights-section">
          <h4 className="filter-insights-section-title">Filtros Aplicados:</h4>
          <div className="filter-insights-filters">
            {selectedLabelNames.length > 0 && (
              <div className="filter-insights-filter-item">
                <span className="filter-insights-filter-label">Legendas:</span>
                <div className="filter-insights-filter-tags">
                  {selectedLabelNames.map((name, idx) => (
                    <span key={idx} className="filter-insights-filter-tag">{name}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedAssigneeNames.length > 0 && (
              <div className="filter-insights-filter-item">
                <span className="filter-insights-filter-label">Responsáveis:</span>
                <div className="filter-insights-filter-tags">
                  {selectedAssigneeNames.map((name, idx) => (
                    <span key={idx} className="filter-insights-filter-tag">{name}</span>
                  ))}
                </div>
              </div>
            )}
            {statusText !== 'Todos' && (
              <div className="filter-insights-filter-item">
                <span className="filter-insights-filter-label">Status:</span>
                <span className="filter-insights-filter-tag">{statusText}</span>
              </div>
            )}
            {dateText !== 'Todos' && (
              <div className="filter-insights-filter-item">
                <span className="filter-insights-filter-label">Data:</span>
                <span className="filter-insights-filter-tag">{dateText}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Estatísticas por coluna */}
        {insights.columnStats.length > 0 && (
          <div className="filter-insights-section">
            <h4 className="filter-insights-section-title">Por Coluna:</h4>
            <div className="filter-insights-columns">
              {insights.columnStats.map((stat, idx) => (
                <div key={idx} className="filter-insights-column-item">
                  <span className="filter-insights-column-name">{stat.columnName}</span>
                  <span className="filter-insights-column-stats">
                    {stat.visible} visíveis
                    {stat.hidden > 0 && <span className="filter-insights-column-hidden"> ({stat.hidden} ocultos)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Estatísticas de conclusão */}
        <div className="filter-insights-section">
          <h4 className="filter-insights-section-title">Status de Conclusão:</h4>
          <div className="filter-insights-completion">
            <div className="filter-insights-completion-item">
              <span className="filter-insights-completion-label">Concluídos:</span>
              <span className="filter-insights-completion-value">{insights.completedCount}</span>
            </div>
            <div className="filter-insights-completion-item">
              <span className="filter-insights-completion-label">Pendentes:</span>
              <span className="filter-insights-completion-value">{insights.pendingCount}</span>
            </div>
          </div>
        </div>
        
        {/* Estatísticas por responsável (se houver) */}
        {Object.keys(insights.assigneeStats).length > 0 && (
          <div className="filter-insights-section">
            <h4 className="filter-insights-section-title">Por Responsável:</h4>
            <div className="filter-insights-assignees">
              {Object.entries(insights.assigneeStats)
                .sort((a, b) => b[1] - a[1])
                .map(([assignee, count]) => (
                  <div key={assignee} className="filter-insights-assignee-item">
                    <span className="filter-insights-assignee-name">{assignee}</span>
                    <span className="filter-insights-assignee-count">{count} cards</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterInsights
