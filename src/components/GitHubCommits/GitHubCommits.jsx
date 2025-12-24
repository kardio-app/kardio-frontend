import { useState, useEffect } from 'react'
import { fixEncoding } from '../../utils/fixEncoding'
import './GitHubCommits.css'

function GitHubCommits() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/kardio-app/kardio-frontend/commits?sha=main&per_page=5',
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
        
        // Garantir que a resposta seja tratada como UTF-8
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
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }
  }


  const truncateMessage = (message) => {
    // Corrigir encoding antes de truncar
    const fixedMessage = fixEncoding(message)
    const maxLength = 60
    if (fixedMessage.length <= maxLength) return fixedMessage
    return fixedMessage.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="github-commits-container">
        <div className="github-commits-header">
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
            className="github-commits-icon"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
          <h3 className="github-commits-title">Últimos Commits</h3>
        </div>
        <div className="github-commits-loading">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="github-commits-container">
        <div className="github-commits-header">
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
            className="github-commits-icon"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
          <h3 className="github-commits-title">Últimos Commits</h3>
        </div>
        <div className="github-commits-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="github-commits-container">
      <div className="github-commits-header">
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
          className="github-commits-icon"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
          <path d="M9 18c-4.51 2-5-2-7-2"></path>
        </svg>
        <h3 className="github-commits-title">Últimos Commits</h3>
      </div>
      <div className="github-commits-list">
        {commits.map((commit) => (
          <a
            key={commit.sha}
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="github-commit-item"
          >
            <div className="github-commit-message">
              {truncateMessage(commit.commit.message.split('\n')[0])}
            </div>
            <div className="github-commit-meta">
              <span className="github-commit-author">
                {fixEncoding(commit.author?.login || commit.commit.author.name)}
              </span>
              <span className="github-commit-date">
                {formatDate(commit.commit.author.date)}
              </span>
            </div>
          </a>
        ))}
      </div>
      <a
        href="https://github.com/kardio-app/kardio-frontend/commits/main"
        target="_blank"
        rel="noopener noreferrer"
        className="github-commits-footer"
      >
        Ver todos os commits
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
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
  )
}

export default GitHubCommits

