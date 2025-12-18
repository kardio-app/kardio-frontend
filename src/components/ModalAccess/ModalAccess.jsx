import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading/Loading'
import { accessProject, getBoard } from '../../services/api'
import './ModalAccess.css'

function ModalAccess({ onClose }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [boardData, setBoardData] = useState(null)

  useEffect(() => {
    if (isLoading && projectResult && boardData) {
      // Armazenar dados pré-carregados no sessionStorage
      sessionStorage.setItem(`board_preload_${projectResult.encryptedLink}`, JSON.stringify(boardData))
      
      const timer = setTimeout(() => {
        navigate(`/board/${projectResult.encryptedLink}`)
        setIsLoading(false)
        setProjectResult(null)
        setBoardData(null)
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isLoading, projectResult, boardData, navigate, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError('Por favor, insira um código')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await accessProject(code.trim().toUpperCase())
      setProjectResult(result)
      
      // Pré-carregar dados do board durante o loading
      try {
        const boardData = await getBoard(result.encryptedLink)
        setBoardData(boardData)
      } catch (boardError) {
        console.error('Erro ao pré-carregar board:', boardError)
        // Continua mesmo se falhar o pré-carregamento
      }
    } catch (error) {
      setError(error.message || 'Código inválido')
      setIsLoading(false)
      setProjectResult(null)
      setBoardData(null)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <>
      {isLoading && <Loading message="Entrando no projeto..." />}
      {!isLoading && (
        <div className="modal-access-backdrop" onClick={handleBackdropClick}>
          <div className="modal-access-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-access-header">
          <h3 className="modal-access-title">Entrar no Projeto</h3>
          <button
            className="modal-access-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form className="modal-access-form" onSubmit={handleSubmit}>
          <div className="modal-access-field">
            <label className="modal-access-label">Código do Projeto</label>
            <input
              className="modal-access-input"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="Digite o código do projeto"
              autoFocus
            />
            {error && (
              <p className="modal-access-error">{error}</p>
            )}
          </div>

          <div className="modal-access-actions">
            <button
              type="button"
              className="modal-access-button modal-access-button-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-access-button modal-access-button-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
      )}
    </>,
    document.body
  )
}

export default ModalAccess

