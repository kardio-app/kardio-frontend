import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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
  const boardDataRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    let pollInterval = null
    let consecutiveErrors = 0
    let currentPollInterval = 10000 // Intervalo atual (pode aumentar em caso de erros)
    const POLL_INTERVAL = 10000 // 10 segundos (intervalo normal)
    const MAX_CONSECUTIVE_ERRORS = 3

    // Função para comparar se os dados mudaram
    const hasDataChanged = (oldData, newData) => {
      if (!oldData || !newData) return true
      
      // Comparar nome
      if (oldData.name !== newData.name) return true
      
      // Comparar colunas
      const oldColumns = oldData.columns || []
      const newColumns = newData.columns || []
      
      if (oldColumns.length !== newColumns.length) return true
      
      // Comparar cada coluna e seus cards
      for (let i = 0; i < newColumns.length; i++) {
        const newCol = newColumns[i]
        const oldCol = oldColumns.find(c => c.id === newCol.id)
        
        if (!oldCol) return true
        if (oldCol.name !== newCol.name) return true
        if (oldCol.position !== newCol.position) return true
        
        // Comparar cards
        const oldCards = oldCol.cards || []
        const newCards = newCol.cards || []
        
        if (oldCards.length !== newCards.length) return true
        
        for (let j = 0; j < newCards.length; j++) {
          const newCard = newCards[j]
          const oldCard = oldCards.find(c => c.id === newCard.id)
          
          if (!oldCard) return true
          if (oldCard.title !== newCard.title) return true
          if (oldCard.description !== newCard.description) return true
          if (oldCard.assignee !== newCard.assignee) return true
          if (oldCard.position !== newCard.position) return true
        }
      }
      
      return false
    }

    const loadBoard = async (silent = false, preloadedData = null) => {
      // Não fazer polling se a página não estiver visível
      if (silent && document.hidden) {
        return
      }

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
        
        // Verificar se os dados mudaram antes de atualizar
        const hasChanged = hasDataChanged(boardDataRef.current, boardDataToUse)
        
        if (hasChanged || !silent) {
          // Atualizar o store com os dados do backend
          updateBoard(boardId, {
            id: boardDataToUse.id,
            name: boardDataToUse.name,
            columns: boardDataToUse.columns || []
          })
          
          setBoardData(boardDataToUse)
          boardDataRef.current = boardDataToUse // Atualizar ref
          document.title = `${boardDataToUse.name} - @kardio`
          
          // Resetar contador de erros em caso de sucesso
          consecutiveErrors = 0
        }
        
        setError(null)
      } catch (err) {
        if (!isMounted) return
        
        consecutiveErrors++
        
        // Só mostrar/logar erro se não for erro de rede/serviço indisponível
        const isNetworkError = err.message.includes('Failed to fetch') || 
                               err.message.includes('CORS') ||
                               err.message.includes('503') ||
                               err.message.includes('502')
        
        if (!isNetworkError) {
          console.error('Erro ao carregar board:', err)
        }
        
        // Não mostrar erro se for polling silencioso ou erro de rede
        if (!silent && !isNetworkError) {
          setError(err.message)
        }
        
        // Se houver muitos erros consecutivos, aumentar o intervalo
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && pollInterval) {
          clearInterval(pollInterval)
          // Aumentar intervalo para 30 segundos após muitos erros
          currentPollInterval = 30000
          pollInterval = setInterval(() => {
            if (!document.hidden) {
              loadBoard(true)
            }
          }, currentPollInterval)
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

    // Configurar polling para sincronização em tempo real
    if (boardId) {
      pollInterval = setInterval(() => {
        // Só fazer polling se a página estiver visível
        if (!document.hidden) {
          loadBoard(true) // Carregamento silencioso
        }
      }, currentPollInterval)
    }

    // Pausar polling quando a página não estiver visível
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página não está visível, pausar polling
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
      } else {
        // Página voltou a ficar visível, retomar polling
        if (!pollInterval && boardId) {
          // Resetar intervalo para o normal quando voltar a ficar visível
          currentPollInterval = POLL_INTERVAL
          consecutiveErrors = 0
          pollInterval = setInterval(() => {
            if (!document.hidden) {
              loadBoard(true)
            }
          }, currentPollInterval)
          // Carregar imediatamente quando voltar a ficar visível
          loadBoard(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
    document.title = `${newName} - @kardio`
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

