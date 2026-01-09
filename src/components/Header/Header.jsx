import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import { updateProjectName, getProject, linkPersonalProjectToManager } from '../../services/api'
import LabelsManager from '../LabelsManager/LabelsManager'
import ModalFilters from '../ModalFilters/ModalFilters'
import './Header.css'

function Header({ boardId, boardName, showToast, onNameUpdate, isManagerial = false }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const [isEditing, setIsEditing] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [accessCode, setAccessCode] = useState(null)
  const [shareCode, setShareCode] = useState(null)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [showLabelsManager, setShowLabelsManager] = useState(false)
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false)
  const [linkProjectCode, setLinkProjectCode] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const currentBoard = boards[boardId] || getBoard(boardId)
  // Priorizar boardName (vem do banco) sobre currentBoard.name (pode estar desatualizado)
  const [name, setName] = useState(boardName || currentBoard?.name || 'Novo Projeto')

  // Sincronizar nome quando board mudar ou quando boardName mudar
  useEffect(() => {
    if (!isEditing) {
      // Priorizar boardName que vem do banco de dados
      const newName = boardName || currentBoard?.name || 'Novo Projeto'
      if (newName !== name) {
        setName(newName)
      }
    }
  }, [boardName, currentBoard?.name, isEditing])

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

  const handleShowAccess = async () => {
    setShowAccessModal(true)
    setLoadingCodes(true)
    setShowAccessCode(false)
    
    try {
      const projectData = await getProject(boardId)
      setAccessCode(projectData.accessCode)
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error)
      if (showToast) {
        showToast('Erro ao buscar código de acesso', 'error')
      }
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleShowShare = async () => {
    if (isManagerial) {
      // Para projetos gerenciais, mostrar código de compartilhamento
      setShowShareModal(true)
      setLoadingCodes(true)
      
      try {
        const projectData = await getProject(boardId)
        setShareCode(projectData.shareCode)
      } catch (error) {
        console.error('Erro ao buscar código de compartilhamento:', error)
        if (showToast) {
          showToast('Erro ao buscar código de compartilhamento', 'error')
        }
      } finally {
        setLoadingCodes(false)
      }
    } else {
      // Para projetos pessoais, mostrar código de acesso (comportamento antigo)
      setShowShareModal(true)
      setLoadingCodes(true)
      
      try {
        const projectData = await getProject(boardId)
        setAccessCode(projectData.accessCode)
      } catch (error) {
        console.error('Erro ao buscar código de acesso:', error)
        if (showToast) {
          showToast('Erro ao buscar código de acesso', 'error')
        }
      } finally {
        setLoadingCodes(false)
      }
    }
  }

  const handleCopyAccessCode = async () => {
    if (accessCode) {
      try {
        await navigator.clipboard.writeText(accessCode)
        setCopied(true)
        if (showToast) {
          showToast('Código de acesso copiado!', 'success')
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

  const handleCopyShareCode = async () => {
    if (shareCode) {
      try {
        await navigator.clipboard.writeText(shareCode)
        setCopied(true)
        if (showToast) {
          showToast('Código de compartilhamento copiado!', 'success')
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

  const handleCloseAccessModal = () => {
    setShowAccessModal(false)
    setAccessCode(null)
    setShowAccessCode(false)
    setCopied(false)
  }

  const handleCloseShareModal = () => {
    setShowShareModal(false)
    setAccessCode(null)
    setShareCode(null)
    setCopied(false)
  }

  const handleLinkProject = async (e) => {
    e.preventDefault()
    if (!linkProjectCode.trim() || !boardId) return

    setIsLinking(true)
    try {
      await linkPersonalProjectToManager(boardId, linkProjectCode.trim().toUpperCase())
      setShowLinkProjectModal(false)
      setLinkProjectCode('')
      // Disparar evento para atualizar lista de projetos vinculados
      window.dispatchEvent(new CustomEvent('manager-link-changed'))
      if (showToast) {
        showToast('Projeto vinculado com sucesso!', 'success')
      }
    } catch (error) {
      if (showToast) {
        showToast('Erro ao vincular projeto: ' + error.message, 'error')
      }
    } finally {
      setIsLinking(false)
    }
  }

  const handleCloseLinkProjectModal = () => {
    setShowLinkProjectModal(false)
    setLinkProjectCode('')
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
        {!isManagerial && (
          <>
            <button
              className="header-button header-button-icon"
              onClick={() => setShowFilters(true)}
              title="Filtrar cards"
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
            <button
              className="header-button header-button-icon"
              onClick={() => setShowLabelsManager(true)}
              title="Gerenciar legendas"
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
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </button>
          </>
        )}
        {isManagerial ? (
          <>
            <button
              className="header-button header-button-icon"
              onClick={() => setShowLinkProjectModal(true)}
              title="Adicionar projeto vinculado"
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              className="header-button header-button-icon"
              onClick={handleShowAccess}
              title="Código de acesso"
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
            <button
              className="header-button header-button-icon"
              onClick={handleShowShare}
              title="Código de compartilhamento"
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
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </>
        ) : (
          <button
            className="header-button header-button-icon"
            onClick={handleShowShare}
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
        )}
      </div>
      {showFilters && (
        <ModalFilters
          boardId={boardId}
          onClose={() => setShowFilters(false)}
        />
      )}
      {showLabelsManager && (
        <LabelsManager
          boardId={boardId}
          showToast={showToast}
          onClose={() => setShowLabelsManager(false)}
        />
      )}
      {/* Modal de Código de Acesso (apenas para projetos gerenciais) */}
      {isManagerial && showAccessModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseAccessModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Código de Acesso</h2>
              <button className="share-modal-close" onClick={handleCloseAccessModal}>
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <p className="share-modal-label">Código de Acesso:</p>
              {loadingCodes ? (
                <div className="share-modal-loading">Carregando...</div>
              ) : accessCode ? (
                <div className="share-modal-code-container">
                  <div className="share-modal-code-with-eye">
                    <span className="share-modal-code-masked">
                      {showAccessCode ? accessCode : '******'}
                    </span>
                    <button
                      className="share-modal-eye-button"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      title={showAccessCode ? 'Ocultar código' : 'Mostrar código'}
                    >
                      {showAccessCode ? (
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
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    className="share-modal-copy-button"
                    onClick={handleCopyAccessCode}
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
                Use este código para acessar o projeto gerencial
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Código de Compartilhamento (apenas para projetos gerenciais) */}
      {isManagerial && showShareModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Código de Compartilhamento</h2>
              <button className="share-modal-close" onClick={handleCloseShareModal}>
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <p className="share-modal-label">Código de Compartilhamento:</p>
              {loadingCodes ? (
                <div className="share-modal-loading">Carregando...</div>
              ) : shareCode ? (
                <div className="share-modal-code-container">
                  <button
                    className="share-modal-code"
                    onClick={handleCopyShareCode}
                    title="Clique para copiar"
                  >
                    {shareCode}
                  </button>
                  <button
                    className="share-modal-copy-button"
                    onClick={handleCopyShareCode}
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
                Compartilhe este código para que projetos pessoais possam vincular este gestor
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para Vincular Projeto (para projetos gerenciais) */}
      {isManagerial && showLinkProjectModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseLinkProjectModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Adicionar Projeto Vinculado</h2>
              <button className="share-modal-close" onClick={handleCloseLinkProjectModal}>
                ×
              </button>
            </div>
            <form className="share-modal-content" onSubmit={handleLinkProject}>
              <p className="share-modal-label">Código de Acesso do Projeto Pessoal:</p>
              <input
                type="text"
                className="share-modal-input"
                value={linkProjectCode}
                onChange={(e) => setLinkProjectCode(e.target.value.toUpperCase())}
                placeholder="Digite o código de acesso"
                maxLength={20}
                required
                autoFocus
              />
              <p className="share-modal-hint">
                Insira o código de acesso do projeto pessoal que deseja vincular a este projeto gerencial.
              </p>
              <div className="share-modal-actions">
                <button
                  type="button"
                  className="share-modal-button-cancel"
                  onClick={handleCloseLinkProjectModal}
                  disabled={isLinking}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="share-modal-button-submit"
                  disabled={!linkProjectCode.trim() || isLinking}
                >
                  {isLinking ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para Vincular Projeto (para projetos gerenciais) */}
      {isManagerial && showLinkProjectModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseLinkProjectModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Adicionar Projeto Vinculado</h2>
              <button className="share-modal-close" onClick={handleCloseLinkProjectModal}>
                ×
              </button>
            </div>
            <form className="share-modal-content" onSubmit={handleLinkProject}>
              <p className="share-modal-label">Código de Acesso do Projeto Pessoal:</p>
              <input
                type="text"
                className="share-modal-input"
                value={linkProjectCode}
                onChange={(e) => setLinkProjectCode(e.target.value.toUpperCase())}
                placeholder="Digite o código de acesso"
                maxLength={20}
                required
                autoFocus
              />
              <p className="share-modal-hint">
                Insira o código de acesso do projeto pessoal que deseja vincular a este projeto gerencial.
              </p>
              <div className="share-modal-actions">
                <button
                  type="button"
                  className="share-modal-button-cancel"
                  onClick={handleCloseLinkProjectModal}
                  disabled={isLinking}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="share-modal-button-submit"
                  disabled={!linkProjectCode.trim() || isLinking}
                >
                  {isLinking ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Compartilhamento (para projetos pessoais) */}
      {!isManagerial && showShareModal && createPortal(
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
              {loadingCodes ? (
                <div className="share-modal-loading">Carregando...</div>
              ) : accessCode ? (
                <div className="share-modal-code-container">
                  <button
                    className="share-modal-code"
                    onClick={handleCopyAccessCode}
                    title="Clique para copiar"
                  >
                    {accessCode}
                  </button>
                  <button
                    className="share-modal-copy-button"
                    onClick={handleCopyAccessCode}
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

