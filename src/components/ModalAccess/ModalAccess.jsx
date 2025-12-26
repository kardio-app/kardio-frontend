import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading/Loading'
import { accessProject, getBoard, getProject } from '../../services/api'
import { saveProject } from '../../utils/savedProjects'
import './ModalAccess.css'

function ModalAccess({ onClose }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [boardData, setBoardData] = useState(null)

  useEffect(() => {
    // Para projetos gerenciais, boardData será um objeto vazio {}
    // Para projetos pessoais, boardData será o objeto do board
    if (isLoading && projectResult && boardData !== undefined) {
      // Armazenar dados pré-carregados no sessionStorage (apenas se houver dados)
      if (boardData && Object.keys(boardData).length > 0) {
        sessionStorage.setItem(`board_preload_${projectResult.encryptedLink}`, JSON.stringify(boardData))
      }
      
      const timer = setTimeout(() => {
        // Verificar o tipo do projeto e redirecionar corretamente
        const projectType = projectResult.type || 'personal'
        const route = projectType === 'managerial' 
          ? `/board-gerencial/${projectResult.encryptedLink}`
          : `/board/${projectResult.encryptedLink}`
        
        navigate(route)
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
      
      // Salvar automaticamente no localStorage
      try {
        saveProject({
          name: result.name || 'Projeto sem nome',
          code: code.trim().toUpperCase(),
          encryptedLink: result.encryptedLink
        })
      } catch (saveError) {
        console.error('Erro ao salvar projeto automaticamente:', saveError)
        // Continua mesmo se falhar o salvamento
      }
      
      // Pré-carregar dados do board durante o loading (apenas para projetos pessoais)
      // Projetos gerenciais não têm board, então não precisa pré-carregar
      if (result.type !== 'managerial') {
        try {
          const boardData = await getBoard(result.encryptedLink)
          setBoardData(boardData)
        } catch (boardError) {
          console.error('Erro ao pré-carregar board:', boardError)
          // Continua mesmo se falhar o pré-carregamento
        }
      } else {
        // Para projetos gerenciais, definir boardData como vazio para permitir navegação
        setBoardData({})
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
                const value = e.target.value.toUpperCase().slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="Digite o código do projeto"
              maxLength={6}
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

