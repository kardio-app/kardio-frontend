import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProject, getLinkedProjects, getBoard } from '../../services/api'
import BoardComponent from '../Board/Board'
import useBoardStore from '../../store/useBoardStore'
import './BoardGerencial.css'

function BoardGerencial({ encryptedId, projectData }) {
  const navigate = useNavigate()
  const [linkedProjects, setLinkedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedProjectData, setSelectedProjectData] = useState(null)
  const [boardLoading, setBoardLoading] = useState(false)
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true)
  const updateBoard = useBoardStore((state) => state.updateBoard)

  const loadLinkedProjects = useCallback(async () => {
    if (!encryptedId) return
    
    try {
      const projects = await getLinkedProjects(encryptedId)
      setLinkedProjects(projects || [])
    } catch (error) {
      console.error('Erro ao carregar projetos vinculados:', error)
    } finally {
      setLoading(false)
    }
  }, [encryptedId])

  useEffect(() => {
    loadLinkedProjects()
  }, [loadLinkedProjects])

  // Atualizar projetos vinculados periodicamente
  useEffect(() => {
    if (!encryptedId) return
    
    const interval = setInterval(() => {
      loadLinkedProjects()
    }, 5000) // Atualizar a cada 5 segundos

    return () => clearInterval(interval)
  }, [encryptedId, loadLinkedProjects])

  // Escutar eventos de atualização quando um projeto pessoal vincula/desvincula um gestor
  useEffect(() => {
    if (!encryptedId) return
    
    const handleManagerLinkChange = () => {
      // Pequeno delay para garantir que o backend processou a mudança
      setTimeout(() => {
        loadLinkedProjects()
      }, 500)
    }

    window.addEventListener('manager-link-changed', handleManagerLinkChange)
    
    return () => {
      window.removeEventListener('manager-link-changed', handleManagerLinkChange)
    }
  }, [encryptedId, loadLinkedProjects])

  const maskAccessCode = (code) => {
    if (!code || code.length < 2) return '**'
    return code.substring(0, 2) + '*'.repeat(Math.max(0, code.length - 2))
  }

  const loadSelectedProjectBoard = useCallback(async (projectEncryptedId, silent = false) => {
    if (!projectEncryptedId) return
    
    try {
      if (!silent) {
        setBoardLoading(true)
      }
      
      // Carregar dados do board do backend
      const boardData = await getBoard(projectEncryptedId)
      
      // Atualizar o store com os dados mais recentes
      updateBoard(projectEncryptedId, {
        id: boardData.id,
        name: boardData.name,
        columns: boardData.columns || [],
        labels: boardData.labels || []
      })
      
      // Atualizar nome do projeto se mudou (de forma assíncrona para não bloquear)
      getProject(projectEncryptedId).then(projectData => {
        setSelectedProjectData(prev => {
          if (!prev || prev.name !== projectData.name) {
            return projectData
          }
          return prev
        })
      }).catch(err => {
        console.error('Erro ao atualizar dados do projeto:', err)
      })
    } catch (error) {
      console.error('Erro ao carregar board do projeto:', error)
      if (!silent) {
        alert('Erro ao carregar projeto: ' + error.message)
      }
    } finally {
      if (!silent) {
        setBoardLoading(false)
      }
    }
  }, [updateBoard])

  const handleOpenProject = async (projectEncryptedId) => {
    setSelectedProjectId(projectEncryptedId)
    
    try {
      // Carregar dados do projeto
      const projectData = await getProject(projectEncryptedId)
      setSelectedProjectData(projectData)
      
      // Carregar dados do board
      await loadSelectedProjectBoard(projectEncryptedId, false)
      
      // Scroll para a seção do board
      setTimeout(() => {
        const boardSection = document.getElementById('board-loaded-section')
        if (boardSection) {
          boardSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
      alert('Erro ao carregar projeto: ' + error.message)
      setBoardLoading(false)
    }
  }

  // Atualizar board do projeto selecionado periodicamente
  useEffect(() => {
    if (!selectedProjectId) return
    
    // Carregar imediatamente
    loadSelectedProjectBoard(selectedProjectId, true)
    
    // Atualizar periodicamente a cada 3 segundos
    const interval = setInterval(() => {
      loadSelectedProjectBoard(selectedProjectId, true)
    }, 3000) // Atualizar a cada 3 segundos

    return () => clearInterval(interval)
  }, [selectedProjectId, loadSelectedProjectBoard])

  return (
    <div className="board-gerencial-container">
      <div className="board-gerencial-header">
        <button
          className="board-gerencial-title-button"
          onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
        >
          <h2 className="board-gerencial-title">Projetos Vinculados</h2>
          <svg 
            className={`board-gerencial-title-icon ${isProjectsExpanded ? 'board-gerencial-title-icon-expanded' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {isProjectsExpanded && (
        <>
          {loading ? (
            <div className="board-gerencial-loading">
              <p>Carregando projetos...</p>
            </div>
          ) : linkedProjects.length === 0 ? (
            <div className="board-gerencial-empty">
              <p>Nenhum projeto vinculado ainda.</p>
              <p className="board-gerencial-empty-hint">
                Compartilhe seu código de vinculação com o usuário final para que ele o vincule como seu gestor.
              </p>
            </div>
          ) : (
            <div className="board-gerencial-projects">
              {linkedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`board-gerencial-project-card ${selectedProjectId === project.encrypted_id ? 'board-gerencial-project-card-selected' : ''}`}
                  onClick={() => handleOpenProject(project.encrypted_id)}
                >
                  <h3 className="board-gerencial-project-name">{project.name}</h3>
                  <p className="board-gerencial-project-code">Código: {maskAccessCode(project.access_code)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Seção para carregar o board do projeto selecionado */}
      {selectedProjectId ? (
        <div id="board-loaded-section" className="board-gerencial-loaded-board">
          <div className="board-gerencial-loaded-board-header">
            <h3 className="board-gerencial-loaded-board-title">
              {selectedProjectData?.name || 'Projeto'}
            </h3>
            <button
              className="board-gerencial-loaded-board-close"
              onClick={() => {
                setSelectedProjectId(null)
                setSelectedProjectData(null)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          {boardLoading ? (
            <div className="board-gerencial-loaded-board-loading">
              <p>Carregando projeto...</p>
            </div>
          ) : (
            <div className="board-gerencial-loaded-board-content">
              <BoardComponent 
                boardId={selectedProjectId}
              />
            </div>
          )}
        </div>
      ) : linkedProjects.length > 0 ? (
        <div className="board-gerencial-preview">
          <div className="board-gerencial-preview-content">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="board-gerencial-preview-icon"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
            </svg>
            <h3 className="board-gerencial-preview-title">
              Clique em algum projeto vinculado para visualizar nessa parte
            </h3>
            <p className="board-gerencial-preview-description">
              Selecione um projeto da lista acima para ver seus cards, colunas e informações detalhadas.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BoardGerencial

