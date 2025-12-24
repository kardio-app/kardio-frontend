import { useState } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import './ModalMoveColumn.css'

function ModalMoveColumn({ boardId, columnId, currentPosition, totalColumns, onClose, showToast }) {
  const moveColumn = useBoardStore((state) => state.moveColumn)
  const [selectedPosition, setSelectedPosition] = useState(currentPosition)
  const [isMoving, setIsMoving] = useState(false)

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleMove = async () => {
    if (selectedPosition === currentPosition) {
      onClose()
      return
    }

    setIsMoving(true)
    try {
      // Usar moveColumn que já tem optimistic update
      await moveColumn(boardId, currentPosition, selectedPosition)
      if (showToast) {
        showToast('Coluna movida', 'success')
      }
      onClose()
    } catch (error) {
      console.error('Erro ao mover coluna:', error)
      if (showToast) {
        showToast('Erro ao mover coluna', 'error')
      }
    } finally {
      setIsMoving(false)
    }
  }

  return createPortal(
    <div className="modal-move-column-backdrop" onClick={handleBackdropClick}>
      <div className="modal-move-column-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-move-column-header">
          <h3 className="modal-move-column-title">Mover Coluna</h3>
          <button
            className="modal-move-column-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-move-column-body">
          <p className="modal-move-column-message">
            Sua coluna está na posição <strong>{currentPosition + 1}</strong>. Deseja movimentar para qual posição?
          </p>
          
          <div className="modal-move-column-positions">
            {Array.from({ length: totalColumns }, (_, i) => (
              <button
                key={i}
                className={`modal-move-column-position ${selectedPosition === i ? 'active' : ''} ${i === currentPosition ? 'current' : ''}`}
                onClick={() => {
                  if (i !== currentPosition) {
                    setSelectedPosition(i)
                  }
                }}
                disabled={isMoving || i === currentPosition}
              >
                {i === currentPosition && (
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
                    className="modal-move-column-position-lock"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                )}
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-move-column-actions">
          <button
            className="modal-move-column-button modal-move-column-button-cancel"
            onClick={onClose}
            disabled={isMoving}
          >
            Cancelar
          </button>
          <button
            className="modal-move-column-button modal-move-column-button-confirm"
            onClick={handleMove}
            disabled={isMoving || selectedPosition === currentPosition}
          >
            {isMoving ? 'Movendo...' : 'Mover'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalMoveColumn

