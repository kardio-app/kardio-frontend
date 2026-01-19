import { useEffect, useState } from 'react'
import './Loading.css'

function Loading({ message = 'Criando novo projeto...', showFunFacts = false }) {
  const [currentFunFact, setCurrentFunFact] = useState(0)

  const funFacts = [
    "Você sabia que o Kardio foi desenvolvido pelo @initpedro?",
    "Você sabia que você consegue usar o Kardio para organizar qualquer tipo de projeto?",
    "Você sabia que o Kardio é 100% gratuito e open source?",
    "Você sabia que o Kardio não coleta nenhum dado pessoal dos usuários?",
    "Você sabia que o Kardio foi criado para ser simples e eficiente?",
    "Você sabia que você pode criar projetos ilimitados no Kardio?",
    "Você sabia que o Kardio suporta projetos pessoais e gerenciais?",
    "Você sabia que você pode contribuir com o desenvolvimento do Kardio no GitHub?",
    "Você sabia que o Kardio usa inteligência artificial para gerar projetos automaticamente?",
    "Você sabia que o Kardio é otimizado para dispositivos móveis?",
  ]

  useEffect(() => {
    let interval
    if (showFunFacts) {
      interval = setInterval(() => {
        setCurrentFunFact((prev) => (prev + 1) % funFacts.length)
      }, 3000) // Troca a mensagem a cada 3 segundos
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showFunFacts, funFacts.length])
  useEffect(() => {
    // Desabilitar scroll do body e html quando o Loading estiver ativo
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyOverflowX = document.body.style.overflowX
    const originalBodyOverflowY = document.body.style.overflowY
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlOverflowX = document.documentElement.style.overflowX
    const originalHtmlOverflowY = document.documentElement.style.overflowY
    
    document.body.style.overflow = 'hidden'
    document.body.style.overflowX = 'hidden'
    document.body.style.overflowY = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    document.documentElement.style.overflowY = 'hidden'
    
    // Reabilitar scroll quando o componente desmontar
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.overflowX = originalBodyOverflowX
      document.body.style.overflowY = originalBodyOverflowY
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.overflowX = originalHtmlOverflowX
      document.documentElement.style.overflowY = originalHtmlOverflowY
    }
  }, [])

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-boxes">
          <div className="loading-box loading-box-1"></div>
          <div className="loading-box loading-box-2"></div>
          <div className="loading-box loading-box-3"></div>
          <div className="loading-box loading-box-4"></div>
          <div className="loading-box loading-box-5"></div>
          <div className="loading-box loading-box-6"></div>
        </div>
        <p className="loading-message">{message}</p>
        {showFunFacts && (
          <p className="loading-fun-fact">{funFacts[currentFunFact]}</p>
        )}
      </div>
    </div>
  )
}

export default Loading


