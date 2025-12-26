import { useState, useEffect, useRef } from 'react'
import { getComments, createComment } from '../../services/api'
import './CommentsSection.css'

function CommentsSection({ boardId, cardId, showToast }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [author, setAuthor] = useState(() => {
    // Carregar nome do autor do localStorage se existir
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kardio_comment_author') || ''
    }
    return ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentsEndRef = useRef(null)
  const authorInputRef = useRef(null)

  // Salvar nome do autor no localStorage quando mudar
  useEffect(() => {
    if (author.trim() && typeof window !== 'undefined') {
      localStorage.setItem('kardio_comment_author', author.trim())
    }
  }, [author])

  // Carregar comentários ao montar o componente
  useEffect(() => {
    let pollInterval = null
    
    // Função para carregar comentários
    const loadCommentsData = async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true)
        }
        const commentsData = await getComments(boardId, cardId)
        
        // Só atualizar se os comentários mudaram (evitar re-render desnecessário)
        setComments(prev => {
          const currentIds = JSON.stringify(prev.map(c => c.id).sort())
          const newIds = JSON.stringify((commentsData || []).map(c => c.id).sort())
          
          if (currentIds !== newIds) {
            return commentsData || []
          }
          return prev
        })
      } catch (error) {
        console.error('Erro ao carregar comentários:', error)
        if (!silent && showToast) {
          showToast('Erro ao carregar comentários', 'error')
        }
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    }
    
    // Carregar inicialmente
    loadCommentsData()
    
    // Configurar polling para sincronização em tempo real (a cada 5 segundos)
    pollInterval = setInterval(() => {
      if (!document.hidden) {
        loadCommentsData(true) // Carregamento silencioso
      }
    }, 5000)
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [boardId, cardId, showToast])

  // Scroll para o final quando novos comentários são adicionados
  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadComments = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      const commentsData = await getComments(boardId, cardId)
      
      // Só atualizar se os comentários mudaram (evitar re-render desnecessário)
      const currentIds = JSON.stringify(comments.map(c => c.id).sort())
      const newIds = JSON.stringify((commentsData || []).map(c => c.id).sort())
      
      if (currentIds !== newIds) {
        setComments(commentsData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      if (!silent && showToast) {
        showToast('Erro ao carregar comentários', 'error')
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      return
    }

    const commentContent = newComment.trim()
    const commentAuthor = author.trim() || 'Anônimo'
    
    // OPTIMISTIC UPDATE: Adicionar comentário imediatamente
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempComment = {
      id: tempId,
      card_id: cardId,
      content: commentContent,
      author: commentAuthor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setComments(prev => [...prev, tempComment])
    setNewComment('')
    
    setIsSubmitting(true)
    
    try {
      const savedComment = await createComment(boardId, cardId, {
        content: commentContent,
        author: commentAuthor
      })
      
      // Substituir comentário temporário pelo real
      setComments(prev => prev.map(c => c.id === tempId ? savedComment : c))
      
      if (showToast) {
        showToast('Comentário adicionado', 'success')
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
      // ROLLBACK: Remover comentário temporário em caso de erro
      setComments(prev => prev.filter(c => c.id !== tempId))
      if (showToast) {
        showToast('Erro ao adicionar comentário', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return 'Agora'
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} atrás`
    } else if (diffHours < 24) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
    } else if (diffDays < 7) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="comments-section">
      <div className="comments-section-header">
        <div className="comments-section-title-wrapper">
          <svg className="comments-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3 className="comments-section-title">Comentários</h3>
        </div>
      </div>

      <div className="comments-section-content">
        {isLoading ? (
          <div className="comments-loading">Carregando comentários...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-content">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-meta-text"> comentou em </span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                  <span className="comment-meta-text">: </span>
                  <span className="comment-text">{comment.content}</span>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      <form className="comments-form" onSubmit={handleSubmit}>
        <div className="comments-form-author">
          <input
            ref={authorInputRef}
            type="text"
            className="comments-author-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Seu nome (opcional)"
            maxLength={255}
          />
        </div>
        <div className="comments-form-message">
          <input
            type="text"
            className="comments-message-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="comments-submit-button"
            disabled={!newComment.trim() || isSubmitting}
            title="Enviar comentário"
          >
            {isSubmitting ? (
              <svg className="comments-submit-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentsSection

