import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './ColumnDropdown.css'

function ColumnDropdown({ onEditLabel, onDelete, onClose, position, hasLabel }) {
  const [isOpen, setIsOpen] = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      onClose()
    }, 150)
  }

  const handleEditLabel = () => {
    handleClose()
    onEditLabel()
  }

  const handleDelete = () => {
    handleClose()
    onDelete()
  }

  if (!isOpen) return null

  const dropdownStyle = position ? {
    top: `${position.top}px`,
    left: `${position.left}px`
  } : {}

  return createPortal(
    <div className="column-dropdown-backdrop" onClick={handleClose}>
      <div 
        ref={dropdownRef}
        className="column-dropdown-content"
        style={dropdownStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="column-dropdown-item"
          onClick={handleEditLabel}
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
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <span>{hasLabel ? 'Editar legenda' : 'Adicionar legenda'}</span>
        </button>
        <button
          className="column-dropdown-item column-dropdown-item-danger"
          onClick={handleDelete}
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
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          <span>Excluir coluna</span>
        </button>
      </div>
    </div>,
    document.body
  )
}

export default ColumnDropdown

