import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import { updateProjectName, getProject } from '../../services/api'
import './Header.css'

function Header({ boardId, boardName, showToast, onNameUpdate }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const [isEditing, setIsEditing] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [accessCode, setAccessCode] = useState(null)
  const [loadingAccessCode, setLoadingAccessCode] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const currentBoard = boards[boardId] || getBoard(boardId)
  const [name, setName] = useState(boardName || currentBoard.name)

  // Sincronizar nome quando board mudar ou quando boardName mudar
  useEffect(() => {
    if (!isEditing) {
      const newName = boardName || currentBoard.name
      setName(newName)
    }
  }, [currentBoard.name, boardName, isEditing])

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleNameBlur = async () => {
    setIsEditing(false)
    if (name.trim() && name.trim() !== currentBoard.name) {
      const newName = name.trim()
      const previousName = currentBoard.name
      
      // OPTIMISTIC UPDATE: Atualizar visualmente imediatamente
      updateBoard(boardId, { name: newName })
      setName(newName) // Atualizar estado local também
      if (onNameUpdate) {
        onNameUpdate(newName)
      }
      
      // Fazer request em paralelo (sem bloquear a UI)
      updateProjectName(boardId, newName)
        .then(() => {
          if (showToast) {
            showToast('Nome do projeto atualizado', 'success')
          }
        })
        .catch((error) => {
          console.error('Erro ao atualizar nome do projeto:', error)
          // ROLLBACK: Reverter para o nome anterior em caso de erro
          updateBoard(boardId, { name: previousName })
          setName(previousName)
          if (onNameUpdate) {
            onNameUpdate(previousName)
          }
          if (showToast) {
            showToast('Erro ao atualizar nome do projeto', 'error')
          }
        })
    } else {
      setName(currentBoard.name)
    }
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const handleShare = async () => {
    setShowShareModal(true)
    setLoadingAccessCode(true)
    
    try {
      const projectData = await getProject(boardId)
      setAccessCode(projectData.accessCode)
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error)
      if (showToast) {
        showToast('Erro ao buscar código de acesso', 'error')
      }
    } finally {
      setLoadingAccessCode(false)
    }
  }

  const handleCopyCode = async () => {
    if (accessCode) {
      try {
        await navigator.clipboard.writeText(accessCode)
        setCopied(true)
        if (showToast) {
          showToast('Código copiado!', 'success')
        }
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar código:', error)
        if (showToast) {
          showToast('Erro ao copiar código', 'error')
        }
      }
    }
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false)
    setAccessCode(null)
    setCopied(false)
  }

  return (
    <header className="header">
      <div className="header-left">
        {isEditing ? (
          <input
            className="header-title-input"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <h1
            className="header-title"
            onClick={() => setIsEditing(true)}
          >
            {name}
          </h1>
        )}
      </div>
      <div className="header-right">
        <button
          className="header-button header-button-icon"
          onClick={handleShare}
          title="Compartilhar projeto"
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
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          </svg>
        </button>
      </div>
      {showShareModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Compartilhar Projeto</h2>
              <button className="share-modal-close" onClick={handleCloseShareModal}>
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <p className="share-modal-label">Código de Acesso:</p>
              {loadingAccessCode ? (
                <div className="share-modal-loading">Carregando...</div>
              ) : accessCode ? (
                <div className="share-modal-code-container">
                  <button
                    className="share-modal-code"
                    onClick={handleCopyCode}
                    title="Clique para copiar"
                  >
                    {accessCode}
                  </button>
                  <button
                    className="share-modal-copy-button"
                    onClick={handleCopyCode}
                    title="Copiar código"
                  >
                    {copied ? (
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
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    ) : (
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
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"></path>
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="share-modal-error">Erro ao carregar código</div>
              )}
              <p className="share-modal-hint">
                Compartilhe este código para que outras pessoas possam acessar o projeto
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}

export default Header

