import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import './ModalColumnLabel.css'

function ModalColumnLabel({ boardId, column, onConfirm, onCancel, showToast }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const [selectedLabelId, setSelectedLabelId] = useState(column?.label_id || null)
  const [isSaving, setIsSaving] = useState(false)

  const board = boards[boardId] || getBoard(boardId)
  const labels = board.labels || []

  useEffect(() => {
    // Focar no primeiro item quando o modal abrir
    const firstLabel = document.querySelector('.modal-column-label-item')
    if (firstLabel) {
      firstLabel.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsSaving(true)
    try {
      await onConfirm({
        label_id: selectedLabelId || null
      })
    } catch (error) {
      console.error('Erro ao salvar legenda:', error)
      if (showToast) {
        showToast('Erro ao salvar legenda', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleLabelClick = (labelId) => {
    // Se clicar na mesma legenda selecionada, desmarcar
    if (selectedLabelId === labelId) {
      setSelectedLabelId(null)
    } else {
      setSelectedLabelId(labelId)
    }
  }

  return createPortal(
    <div 
      className="modal-column-label-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-column-label-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-column-label-header">
          <h3 className="modal-column-label-title">
            Selecionar Legenda da Coluna
          </h3>
          <button
            className="modal-column-label-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form className="modal-column-label-form" onSubmit={handleSubmit}>
          <div className="modal-column-label-field">
            <label className="modal-column-label-label">Legendas Disponíveis</label>
            {labels.length === 0 ? (
              <div className="modal-column-label-empty">
                <p>Nenhuma legenda criada ainda.</p>
                <p className="modal-column-label-empty-hint">Crie legendas no menu do header para usá-las nas colunas.</p>
              </div>
            ) : (
              <div className="modal-column-label-list">
                <button
                  type="button"
                  className={`modal-column-label-item ${selectedLabelId === null ? 'selected' : ''}`}
                  onClick={() => setSelectedLabelId(null)}
                >
                  <div className="modal-column-label-item-preview" style={{ backgroundColor: 'transparent', border: '2px dashed var(--border-color)' }}>
                    <span className="modal-column-label-item-name" style={{ color: 'var(--text-gray)' }}>
                      Sem legenda
                    </span>
                  </div>
                </button>
                {labels.map((label) => {
                  const isSelected = selectedLabelId === label.id
                  return (
                    <button
                      key={label.id}
                      type="button"
                      className={`modal-column-label-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleLabelClick(label.id)}
                    >
                      <div 
                        className="modal-column-label-item-preview" 
                        style={{ backgroundColor: label.color }}
                      >
                        <span 
                          className="modal-column-label-item-name" 
                          style={{ color: getContrastColor(label.color) }}
                        >
                          {label.name}
                        </span>
                      </div>
                      {isSelected && (
                        <svg 
                          className="modal-column-label-check-icon"
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="modal-column-label-actions">
            <button
              type="button"
              className="modal-column-label-button modal-column-label-button-cancel"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-column-label-button modal-column-label-button-submit"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
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
  
  // Calcular luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retornar preto para cores claras e branco para cores escuras
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export default ModalColumnLabel
