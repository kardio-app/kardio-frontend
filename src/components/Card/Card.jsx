import { useState, useEffect, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBoardStore from '../../store/useBoardStore'
import ModalCard from '../ModalCard/ModalCard'
import ModalMoveCard from '../ModalMoveCard/ModalMoveCard'
import './Card.css'

function Card({ boardId, columnId, card, showToast, columns }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
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
    // Não abrir modal se estiver arrastando ou se clicou no handle
    if (!isDragging && !e.target.closest('.card-drag-handle')) {
      setShowModal(true)
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
        <h3 className="card-title">{card.title}</h3>
        {card.description && (
          <p className="card-description">{card.description}</p>
        )}
        {card.assignee && (
          <div className="card-assignee">
            <span className="card-assignee-label">Responsável:</span>
            <span className="card-assignee-name">{card.assignee}</span>
          </div>
        )}
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

