import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Header from '../components/Header/Header'
import BoardGerencialComponent from '../components/BoardGerencial/BoardGerencial'
import { getProject } from '../services/api'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/Toast/ToastContainer'
import useBoardStore from '../store/useBoardStore'
import './BoardGerencial.css'

function BoardGerencial() {
  const { boardId } = useParams() // boardId é o encryptedId
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projectData, setProjectData] = useState(null)
  const { showToast, hideToast, toasts } = useToast()
  const projectDataRef = useRef(null)
  const updateBoard = useBoardStore((state) => state.updateBoard)

  useEffect(() => {
    // Scroll para o topo ao carregar a página
    window.scrollTo(0, 0)
    
    // No mobile, desabilitar scroll do body
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.maxHeight = '100vh'
      document.documentElement.style.height = '100vh'
      document.documentElement.style.maxHeight = '100vh'
    }
    
    return () => {
      // Restaurar scroll ao desmontar
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.height = ''
      document.body.style.maxHeight = ''
      document.documentElement.style.height = ''
      document.documentElement.style.maxHeight = ''
    }
  }, [boardId])

  useEffect(() => {
    let isMounted = true

    const loadProject = async () => {
      try {
        const data = await getProject(boardId)
        if (isMounted) {
          // Validar se o projeto é realmente gerencial
          const projectType = data.type || 'personal'
          
          if (projectType !== 'managerial') {
            // Se não for gerencial, redirecionar para a página correta
            showToast('Este projeto não é gerencial. Redirecionando...', 'warning')
            setTimeout(() => {
              navigate(`/board/${boardId}`)
            }, 1000)
            return
          }
          
          projectDataRef.current = data
          setProjectData(data)
          
          // Atualizar o store com o nome correto do projeto
          updateBoard(boardId, {
            name: data.name || 'Projeto Gerencial'
          })
          
          // Atualizar título da aba do navegador
          document.title = `${data.name || 'Projeto Gerencial'} - @kardiosoftware`
          
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar projeto')
          setLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      isMounted = false
    }
  }, [boardId, navigate, showToast, updateBoard])

  // Handler para atualizar o nome do projeto quando alterado no Header
  const handleNameUpdate = (newName) => {
    setProjectData(prev => {
      if (prev) {
        return { ...prev, name: newName }
      }
      return prev
    })
  }

  // Atualizar título da aba quando o nome do projeto mudar
  useEffect(() => {
    if (projectData?.name) {
      document.title = `${projectData.name} - @kardiosoftware`
    }
    
    // Limpar título ao desmontar
    return () => {
      document.title = '@kardiosoftware'
    }
  }, [projectData?.name])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="board-gerencial-loading">
          <p>Carregando projeto gerencial...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="board-gerencial-error">
          <p>Erro: {error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="board-gerencial-page">
        <Header 
          boardId={boardId}
          boardName={projectData?.name || 'Projeto Gerencial'}
          isManagerial={true}
          onNameUpdate={handleNameUpdate}
          showToast={showToast}
        />
        <BoardGerencialComponent 
          encryptedId={boardId}
          projectData={projectData}
        />
      </div>
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </>
  )
}

export default BoardGerencial

