import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import './ModalMoveCard.css'

function ModalMoveCard({ boardId, columnId, cardId, currentPosition, totalCards, columns, onClose, showToast }) {
  const moveCard = useBoardStore((state) => state.moveCard)
  const [mode, setMode] = useState(null) // 'position' ou 'column'
  const [selectedPosition, setSelectedPosition] = useState(currentPosition)
  const [selectedColumnId, setSelectedColumnId] = useState(columnId)
  const [selectedColumnPosition, setSelectedColumnPosition] = useState(0)
  const [isMoving, setIsMoving] = useState(false)

  const currentColumn = columns.find(col => col.id === columnId)
  const selectedColumn = columns.find(col => col.id === selectedColumnId)
  
  // Quando mudar a coluna selecionada, resetar a posição
  useEffect(() => {
    if (selectedColumnId && selectedColumnId !== columnId) {
      setSelectedColumnPosition(selectedColumn ? selectedColumn.cards.length : 0)
    } else {
      setSelectedColumnPosition(currentPosition)
    }
  }, [selectedColumnId, selectedColumn, columnId, currentPosition])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleMove = async () => {
    setIsMoving(true)
    try {
      if (mode === 'position') {
        // Mover dentro da mesma coluna
        if (selectedPosition !== currentPosition) {
          // Ajustar índice se estiver movendo para baixo (igual ao comportamento do drag)
          let destinationIndex = selectedPosition
          if (currentPosition < selectedPosition) {
            destinationIndex = selectedPosition + 1
          }
          await moveCard(boardId, columnId, columnId, currentPosition, destinationIndex)
          if (showToast) {
            showToast('Tarefa movida', 'success')
          }
        }
      } else if (mode === 'column') {
        // Mover para outra coluna (pode ser a mesma ou diferente)
        let destinationIndex = selectedColumnPosition
        
        // Se for a mesma coluna, ajustar o índice se estiver movendo para baixo
        if (selectedColumnId === columnId) {
          if (currentPosition < selectedColumnPosition) {
            destinationIndex = selectedColumnPosition + 1
          }
        }
        // Se for coluna diferente, o índice já está correto (posição onde queremos inserir)
        
        await moveCard(boardId, columnId, selectedColumnId, currentPosition, destinationIndex)
        if (showToast) {
          showToast('Tarefa movida', 'success')
        }
      }
      onClose()
    } catch (error) {
      console.error('Erro ao mover card:', error)
      if (showToast) {
        showToast('Erro ao mover tarefa', 'error')
      }
    } finally {
      setIsMoving(false)
    }
  }

  const canMove = () => {
    if (mode === 'position') {
      return selectedPosition !== currentPosition
    } else if (mode === 'column') {
      // Pode mover se mudou de coluna ou se mudou a posição na mesma coluna
      return selectedColumnId !== columnId || selectedColumnPosition !== currentPosition
    }
    return false
  }

  return createPortal(
    <div className="modal-move-card-backdrop" onClick={handleBackdropClick}>
      <div className="modal-move-card-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-move-card-header">
          <h3 className="modal-move-card-title">Mover Tarefa</h3>
          <button
            className="modal-move-card-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-move-card-body">
          {!mode ? (
            <div className="modal-move-card-options">
              <button
                className="modal-move-card-option"
                onClick={() => setMode('position')}
              >
                <div className="modal-move-card-option-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="modal-move-card-option-content">
                  <h4>Mudar Posição</h4>
                  <p>Alterar a ordem dentro da coluna atual</p>
                </div>
              </button>

              <button
                className="modal-move-card-option"
                onClick={() => setMode('column')}
              >
                <div className="modal-move-card-option-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="M9 12h6"></path>
                  </svg>
                </div>
                <div className="modal-move-card-option-content">
                  <h4>Mover para Outra Coluna</h4>
                  <p>Transferir a tarefa para uma coluna diferente</p>
                </div>
              </button>
            </div>
          ) : mode === 'position' ? (
            <div className="modal-move-card-mode">
              <p className="modal-move-card-message">
                Sua tarefa está na posição <strong>{currentPosition + 1}</strong>. Deseja movimentar para qual posição?
              </p>
              
              <div className="modal-move-card-positions">
                {Array.from({ length: totalCards }, (_, i) => (
                  <button
                    key={i}
                    className={`modal-move-card-position ${selectedPosition === i ? 'active' : ''} ${i === currentPosition ? 'current' : ''}`}
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
                        className="modal-move-card-position-lock"
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
          ) : (
            <div className="modal-move-card-mode">
              <p className="modal-move-card-message">
                Selecione a coluna de destino:
              </p>
              
              <div className="modal-move-card-columns">
                {columns.map((column) => (
                  <button
                    key={column.id}
                    className={`modal-move-card-column ${selectedColumnId === column.id ? 'active' : ''} ${column.id === columnId ? 'current' : ''}`}
                    onClick={() => {
                      if (column.id !== columnId) {
                        setSelectedColumnId(column.id)
                        setSelectedColumnPosition(column.cards.length)
                      }
                    }}
                    disabled={isMoving || column.id === columnId}
                  >
                    <div className="modal-move-card-column-info">
                      <h4>{column.title}</h4>
                      <p>{column.cards.length} {column.cards.length === 1 ? 'tarefa' : 'tarefas'}</p>
                    </div>
                    {column.id === columnId && (
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
                        className="modal-move-card-column-lock"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                    {selectedColumnId === column.id && column.id !== columnId && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              
              {selectedColumnId && selectedColumn && (
                <div className="modal-move-card-position-selector">
                  <p className="modal-move-card-message">
                    Posição na coluna "{selectedColumn.title}":
                  </p>
                  <div className="modal-move-card-positions">
                    {Array.from({ length: selectedColumnId === columnId ? totalCards : selectedColumn.cards.length + 1 }, (_, i) => {
                      const isCurrentPosition = selectedColumnId === columnId && i === currentPosition
                      return (
                        <button
                          key={i}
                          className={`modal-move-card-position ${selectedColumnPosition === i ? 'active' : ''} ${isCurrentPosition ? 'current' : ''}`}
                          onClick={() => {
                            if (!isCurrentPosition) {
                              setSelectedColumnPosition(i)
                            }
                          }}
                          disabled={isMoving || isCurrentPosition}
                        >
                          {isCurrentPosition && (
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
                              className="modal-move-card-position-lock"
                            >
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          )}
                          <span>{i + 1}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-move-card-actions">
          {mode && (
            <button
              className="modal-move-card-button modal-move-card-button-back"
              onClick={() => setMode(null)}
              disabled={isMoving}
            >
              Voltar
            </button>
          )}
          <button
            className="modal-move-card-button modal-move-card-button-cancel"
            onClick={onClose}
            disabled={isMoving}
          >
            Cancelar
          </button>
          {mode && (
            <button
              className="modal-move-card-button modal-move-card-button-confirm"
              onClick={handleMove}
              disabled={isMoving || !canMove()}
            >
              {isMoving ? 'Movendo...' : 'Mover'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalMoveCard

