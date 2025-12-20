import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBoardStore from '../../store/useBoardStore'
import ModalCard from '../ModalCard/ModalCard'
import './Card.css'

function Card({ boardId, columnId, card, showToast }) {
  const [showModal, setShowModal] = useState(false)

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

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
        {...attributes}
        className="card"
        onClick={handleClick}
        data-dragging={isDragging}
      >
        <div 
          className="card-drag-handle"
          {...listeners}
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
    </>
  )
}

export default Card

