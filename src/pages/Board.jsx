import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useBoardStore from '../store/useBoardStore'
import Navbar from '../components/Navbar/Navbar'
import Header from '../components/Header/Header'
import BoardComponent from '../components/Board/Board'
import { getBoard } from '../services/api'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/Toast/ToastContainer'
import './Board.css'

function Board() {
  const { boardId } = useParams() // boardId agora é o encryptedId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const [boardData, setBoardData] = useState(null)
  const { showToast, hideToast, toasts } = useToast()

  useEffect(() => {
    let isMounted = true
    let pollInterval = null

    const loadBoard = async (silent = false, preloadedData = null) => {
      try {
        if (!silent) {
          setLoading(true)
        }
        
        let boardDataToUse = preloadedData
        
        // Se não tiver dados pré-carregados, buscar do backend
        if (!boardDataToUse) {
          // Verificar se há dados pré-carregados no sessionStorage
          const preloadKey = `board_preload_${boardId}`
          const preloaded = sessionStorage.getItem(preloadKey)
          
          if (preloaded) {
            try {
              boardDataToUse = JSON.parse(preloaded)
              // Remover do sessionStorage após usar
              sessionStorage.removeItem(preloadKey)
            } catch (e) {
              console.error('Erro ao parsear dados pré-carregados:', e)
            }
          }
          
          // Se ainda não tiver dados, buscar do backend
          if (!boardDataToUse) {
            boardDataToUse = await getBoard(boardId)
          }
        }
        
        if (!isMounted) return
        
        // Atualizar o store com os dados do backend
        updateBoard(boardId, {
          id: boardDataToUse.id,
          name: boardDataToUse.name,
          columns: boardDataToUse.columns || []
        })
        
        setBoardData(boardDataToUse)
        document.title = `${boardDataToUse.name} - kardio`
        setError(null)
      } catch (err) {
        if (!isMounted) return
        console.error('Erro ao carregar board:', err)
        // Não mostrar erro se for polling silencioso
        if (!silent) {
          setError(err.message)
        }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    }

    // Carregar inicialmente
    if (boardId) {
      // Verificar se há dados pré-carregados
      const preloadKey = `board_preload_${boardId}`
      const preloaded = sessionStorage.getItem(preloadKey)
      
      if (preloaded) {
        try {
          const preloadedData = JSON.parse(preloaded)
          loadBoard(false, preloadedData)
        } catch (e) {
          // Se der erro ao parsear, carregar normalmente
          loadBoard(false)
        }
      } else {
        loadBoard(false)
      }
    }

    // Configurar polling a cada 3 segundos para sincronização em tempo real
    if (boardId) {
      pollInterval = setInterval(() => {
        loadBoard(true) // Carregamento silencioso
      }, 3000) // Atualizar a cada 3 segundos
    }

    // Cleanup
    return () => {
      isMounted = false
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [boardId, updateBoard])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="board-page">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            Carregando...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="board-page">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-white)' }}>
            <p style={{ marginBottom: '1rem' }}>Erro ao carregar projeto</p>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      </>
    )
  }

  const handleProjectNameUpdate = (newName) => {
    setBoardData(prev => prev ? { ...prev, name: newName } : null)
    document.title = `${newName} - kardio`
  }

  return (
    <>
      <Navbar />
      <div className="board-page">
        <Header 
          boardId={boardId} 
          boardName={boardData?.name || 'Novo Projeto'} 
          showToast={showToast}
          onNameUpdate={handleProjectNameUpdate}
        />
        <BoardComponent boardId={boardId} showToast={showToast} />
      </div>
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </>
  )
}

export default Board

