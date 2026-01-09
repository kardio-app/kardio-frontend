import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBoardStore from '../../store/useBoardStore'
import { updateCard, getComments } from '../../services/api'
import ModalCard from '../ModalCard/ModalCard'
import ModalMoveCard from '../ModalMoveCard/ModalMoveCard'
import './Card.css'

function Card({ boardId, columnId, card, showToast, columns }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateCardInStore = useBoardStore((state) => state.updateCard)
  const [showModal, setShowModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768)
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Buscar contagem de comentários
  const loadCommentsCount = useCallback(async () => {
    try {
      const comments = await getComments(boardId, card.id)
      setCommentsCount(comments?.length || 0)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      setCommentsCount(0)
    }
  }, [boardId, card.id])

  useEffect(() => {
    loadCommentsCount()
  }, [loadCommentsCount])

  // Atualizar contagem quando o modal fechar (pode ter novos comentários)
  useEffect(() => {
    if (!showModal) {
      loadCommentsCount()
    }
  }, [showModal, loadCommentsCount])

  // Obter informações do card atual
  const currentBoard = boards[boardId] || getBoard(boardId)
  const allColumns = columns || currentBoard.columns || []
  const currentColumn = allColumns.find(col => col.id === columnId) || currentBoard.columns.find(col => col.id === columnId)
  const currentPosition = currentColumn ? currentColumn.cards.findIndex(c => c.id === card.id) : -1
  const totalCards = currentColumn ? currentColumn.cards.length : 0
  
  // Obter legendas do card se houver
  const labels = currentBoard.labels || []
  const cardLabelIds = card.label_ids || []
  const cardLabels = cardLabelIds.map(labelId => labels.find(l => l.id === labelId)).filter(Boolean)
  const highlightLabel = card.highlight_label_id ? labels.find(l => l.id === card.highlight_label_id) : null

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  })

  // Otimizar cálculo do transform apenas quando necessário
  const transformString = useMemo(() => {
    return transform ? CSS.Transform.toString(transform) : undefined
  }, [transform])

  const style = useMemo(() => ({
    transform: transformString,
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transformString, transition, isDragging])

  const handleClick = (e) => {
    // Não abrir modal se estiver arrastando, se clicou no handle ou no checkbox
    if (!isDragging && 
        !e.target.closest('.card-drag-handle') && 
        !e.target.closest('.card-completion-checkbox-container') &&
        !e.target.closest('.card-completion-checkbox-label')) {
      setShowModal(true)
    }
  }

  const handleCompletionToggle = async (e) => {
    e.stopPropagation() // Prevenir que abra o modal
    
    const newCompletedState = !card.is_completed
    
    // Atualização otimista
    await updateCardInStore(boardId, columnId, card.id, {
      is_completed: newCompletedState
    })
    
    // Atualizar no backend
    try {
      await updateCard(boardId, card.id, {
        is_completed: newCompletedState
      })
    } catch (error) {
      console.error('Erro ao atualizar status de conclusão:', error)
      // Reverter em caso de erro
      await updateCardInStore(boardId, columnId, card.id, {
        is_completed: !newCompletedState
      })
      if (showToast) {
        showToast('Erro ao atualizar status', 'error')
      }
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(!isMobile ? attributes : {})}
        className="card"
        onClick={handleClick}
        data-dragging={isDragging}
      >
        {highlightLabel && (
          <div className="card-labels-container">
            <div
              className="card-label-bar"
              style={{ backgroundColor: highlightLabel.color }}
              title={highlightLabel.name}
            />
          </div>
        )}
        <div 
          className="card-drag-handle"
          {...(!isMobile ? listeners : {})}
          onClick={(e) => {
            if (isMobile) {
              e.stopPropagation()
              setShowMoveModal(true)
            }
          }}
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
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        <h3 className={`card-title ${card.is_completed ? 'card-title-completed' : ''}`}>
          {card.title}
        </h3>
        {card.description && (
          <p className={`card-description ${card.is_completed ? 'card-description-completed' : ''}`}>
            {card.description}
          </p>
        )}
        <div className="card-footer">
          <div className="card-footer-left">
            {cardLabels.length > 0 && (
              <div className="card-labels-badges">
                {cardLabels.map((label) => (
                  <div
                    key={label.id}
                    className={`card-label-badge ${card.is_completed ? 'card-label-badge-completed' : ''}`}
                    style={{ 
                      backgroundColor: label.color,
                      color: getContrastColor(label.color)
                    }}
                    title={label.name}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="card-label-badge-icon"
                    >
                      <path d="M7 7h.01"></path>
                      <path d="M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"></path>
                    </svg>
                    <span className="card-label-badge-name">{label.name}</span>
                  </div>
                ))}
              </div>
            )}
            {card.created_at && (
              <div className={`card-date-badge ${card.is_completed ? 'card-date-badge-completed' : ''}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="card-date-badge-icon"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="card-date-badge-text">
                  {formatDate(card.created_at)}
                </span>
              </div>
            )}
            {card.assignee && (
              <div className={`card-assignee ${card.is_completed ? 'card-assignee-completed' : ''}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="card-assignee-icon"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="card-assignee-name">{card.assignee}</span>
              </div>
            )}
          </div>
          <div 
            className="card-completion-checkbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-completion-checkbox-wrapper">
              <label 
                className="card-completion-checkbox-label"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  className="card-completion-checkbox"
                  checked={card.is_completed || false}
                  onChange={handleCompletionToggle}
                  onClick={(e) => e.stopPropagation()}
                  title={card.is_completed ? 'Marcar como não concluído' : 'Marcar como concluído'}
                />
                <span className="card-completion-checkbox-custom"></span>
              </label>
            </div>
            <div className="card-comments-indicator">
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="card-comments-count">{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <ModalCard
          boardId={boardId}
          columnId={columnId}
          card={card}
          onClose={() => setShowModal(false)}
          showToast={showToast}
        />
      )}
      {showMoveModal && (
        <ModalMoveCard
          boardId={boardId}
          columnId={columnId}
          cardId={card.id}
          currentPosition={currentPosition}
          totalCards={totalCards}
          columns={allColumns}
          onClose={() => setShowMoveModal(false)}
          showToast={showToast}
        />
      )}
    </>
  )
}

// Função para determinar a cor do texto com melhor contraste
function getContrastColor(hexColor) {
  if (!hexColor || hexColor.length !== 7) return '#FFFFFF'
  
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)
  
  // Calcular luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retornar preto para cores claras e branco para cores escuras
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Função para formatar a data
function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // Se for hoje
  if (diffDays === 0) {
    return 'Hoje'
  }
  
  // Se for ontem
  if (diffDays === 1) {
    return 'Ontem'
  }
  
  // Se for há menos de 7 dias
  if (diffDays < 7) {
    return `${diffDays} dias atrás`
  }
  
  // Se for há menos de 30 dias
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? '1 semana atrás' : `${weeks} semanas atrás`
  }
  
  // Se for há menos de 365 dias
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1 ? '1 mês atrás' : `${months} meses atrás`
  }
  
  // Mais de 1 ano - mostrar data completa
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

export default Card

