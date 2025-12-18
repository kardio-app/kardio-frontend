import './ModalConfirm.css'

function ModalConfirm({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="modal-confirm-backdrop" onClick={handleBackdropClick}>
      <div className="modal-confirm-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-confirm-title">{title}</h3>
        <p className="modal-confirm-message">{message}</p>
        <div className="modal-confirm-actions">
          <button
            className="modal-confirm-button modal-confirm-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="modal-confirm-button modal-confirm-button-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirm

