import { createPortal } from 'react-dom'
import Toast from './Toast'
import './Toast.css'

function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null

  return createPortal(
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          createdAt={toast.createdAt}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer

