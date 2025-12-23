import './ModalConfirm.css'

function ModalConfirm({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', showCloseButton = false }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="modal-confirm-backdrop" onClick={handleBackdropClick}>
      <div className="modal-confirm-content" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button
            className="modal-confirm-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
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

