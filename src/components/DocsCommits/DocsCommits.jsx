import { useState, useEffect } from 'react'
import { fixEncoding } from '../../utils/fixEncoding'
import './DocsCommits.css'

function DocsCommits() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/kardio-app/kardio-frontend/commits?sha=main&per_page=10',
          {
            headers: {
              'Accept': 'application/json',
              'Accept-Charset': 'utf-8'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Erro ao buscar commits')
        }
        
        const text = await response.text()
        const data = JSON.parse(text)
        setCommits(data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar commits do GitHub:', err)
        setError('Não foi possível carregar os commits')
      } finally {
        setLoading(false)
      }
    }

    fetchCommits()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'agora'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} min atrás`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} h atrás`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const formatFullDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCommitType = (message) => {
    const msg = message.toLowerCase()
    if (msg.startsWith('feat')) return { type: 'feature', label: 'Feature', color: '#3b82f6' }
    if (msg.startsWith('fix')) return { type: 'fix', label: 'Fix', color: '#ef4444' }
    if (msg.startsWith('refactor')) return { type: 'refactor', label: 'Refactor', color: '#8b5cf6' }
    if (msg.startsWith('style')) return { type: 'style', label: 'Style', color: '#f59e0b' }
    if (msg.startsWith('docs')) return { type: 'docs', label: 'Docs', color: '#10b981' }
    if (msg.startsWith('test')) return { type: 'test', label: 'Test', color: '#06b6d4' }
    if (msg.startsWith('chore')) return { type: 'chore', label: 'Chore', color: '#6b7280' }
    return { type: 'other', label: 'Commit', color: '#9ca3af' }
  }

  const truncateMessage = (message) => {
    const fixedMessage = fixEncoding(message)
    return fixedMessage
  }

  if (loading) {
    return (
      <div className="docs-commits-container">
        <div className="docs-commits-loading">
          <p>Carregando commits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="docs-commits-container">
        <div className="docs-commits-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="docs-commits-container">
      <div className="docs-commits-header">
        <div className="docs-commits-header-content">
          <div className="docs-commits-header-icon">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </div>
          <div>
            <h2 className="docs-commits-title">Últimos Commits</h2>
            <p className="docs-commits-subtitle">Histórico de desenvolvimento do Kardio</p>
          </div>
        </div>
        <a
          href="https://github.com/kardio-app/kardio-frontend/commits/main"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-commits-view-all"
        >
          Ver todos
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
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </a>
      </div>

      <div className="docs-commits-list">
        {commits.map((commit, index) => {
          const commitType = getCommitType(commit.commit.message)
          const message = commit.commit.message.split('\n')[0]
          const description = commit.commit.message.split('\n').slice(1).filter(l => l.trim()).join('\n')
          
          return (
            <a
              key={commit.sha}
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="docs-commit-item"
            >
              <div className="docs-commit-header">
                <div className="docs-commit-type-badge" style={{ backgroundColor: commitType.color + '20', color: commitType.color }}>
                  {commitType.label}
                </div>
                <span className="docs-commit-sha">{commit.sha.substring(0, 7)}</span>
              </div>
              
              <div className="docs-commit-content">
                <h3 className="docs-commit-message">
                  {truncateMessage(message)}
                </h3>
                {description && (
                  <p className="docs-commit-description">
                    {truncateMessage(description)}
                  </p>
                )}
              </div>

              <div className="docs-commit-footer">
                <div className="docs-commit-author">
                  {commit.author?.avatar_url && (
                    <img 
                      src={commit.author.avatar_url} 
                      alt={commit.author.login}
                      className="docs-commit-avatar"
                    />
                  )}
                  <div className="docs-commit-author-info">
                    <span className="docs-commit-author-name">
                      {fixEncoding(commit.author?.login || commit.commit.author.name)}
                    </span>
                    <span className="docs-commit-date" title={formatFullDate(commit.commit.author.date)}>
                      {formatDate(commit.commit.author.date)}
                    </span>
                  </div>
                </div>
                <div className="docs-commit-stats">
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="docs-commit-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver commit
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default DocsCommits

