import { useState, useEffect } from 'react'
import useBoardStore from '../../store/useBoardStore'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import './ModalCard.css'

function ModalCard({ boardId, columnId, card, onClose, showToast }) {
  const updateCard = useBoardStore((state) => state.updateCard)
  const deleteCard = useBoardStore((state) => state.deleteCard)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [assignee, setAssignee] = useState(card.assignee || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleSave()
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [title, description, assignee])

  const handleSave = async () => {
    try {
      await updateCard(boardId, columnId, card.id, {
        title: title.trim() || card.title,
        description: description.trim(),
        assignee: assignee.trim(),
      })
      if (showToast) {
        showToast('Tarefa atualizada', 'success')
      }
    } catch (error) {
      console.error('Erro ao salvar card:', error)
      if (showToast) {
        showToast('Erro ao salvar alterações', 'error')
      }
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCard(boardId, columnId, card.id)
      setShowDeleteConfirm(false)
      if (showToast) {
        showToast(`Tarefa "${card.title}" excluída`, 'success')
      }
      onClose()
    } catch (error) {
      console.error('Erro ao deletar card:', error)
      if (showToast) {
        showToast('Erro ao excluir tarefa', 'error')
      }
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleSave()
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <input
            className="modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do card"
            onBlur={handleSave}
          />
          <button
            className="modal-close-button"
            onClick={() => {
              handleSave()
              onClose()
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Descrição</label>
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={6}
              onBlur={handleSave}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Responsável</label>
            <input
              className="modal-input"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Nome do responsável"
              onBlur={handleSave}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="modal-button modal-button-delete"
            onClick={handleDelete}
          >
            Excluir
          </button>
          <button
            className="modal-button modal-button-save"
            onClick={() => {
              handleSave()
              onClose()
            }}
          >
            Salvar
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <ModalConfirm
          title="Excluir Tarefa"
          message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      )}
    </div>
  )
}

export default ModalCard

