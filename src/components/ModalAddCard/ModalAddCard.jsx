import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ModalAddCard.css'

function ModalAddCard({ onConfirm, onCancel }) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    // Focar no input quando o modal abrir
    const input = document.querySelector('.modal-add-card-input')
    if (input) {
      input.focus()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onConfirm(title.trim())
      setTitle('')
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

  return createPortal(
    <div 
      className="modal-add-card-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-add-card-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-add-card-header">
          <h3 className="modal-add-card-title">Adicionar Tarefa</h3>
          <button
            className="modal-add-card-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form className="modal-add-card-form" onSubmit={handleSubmit}>
          <div className="modal-add-card-field">
            <label className="modal-add-card-label">Título da Tarefa</label>
            <input
              className="modal-add-card-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
              autoFocus
            />
          </div>

          <div className="modal-add-card-actions">
            <button
              type="button"
              className="modal-add-card-button modal-add-card-button-cancel"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-add-card-button modal-add-card-button-submit"
              disabled={!title.trim()}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default ModalAddCard


