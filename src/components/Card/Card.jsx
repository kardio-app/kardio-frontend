import { useState, useEffect, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBoardStore from '../../store/useBoardStore'
import { updateCard } from '../../services/api'
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        {cardLabels.length > 0 && (
          <div className="card-labels-container">
            {cardLabels.map((label) => (
              <div
                key={label.id}
                className="card-label-bar"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
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
        {card.assignee && (
          <div className={`card-assignee ${card.is_completed ? 'card-assignee-completed' : ''}`}>
            <span className="card-assignee-label">Responsável:</span>
            <span className="card-assignee-name">{card.assignee}</span>
          </div>
        )}
        <div 
          className="card-completion-checkbox-container"
          onClick={(e) => e.stopPropagation()}
        >
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

export default Card

