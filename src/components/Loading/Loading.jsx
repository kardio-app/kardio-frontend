import { useEffect, useState } from 'react'
import './Loading.css'

function Loading({ message = 'Criando novo projeto...', showFunFacts = true }) {
  const [currentFunFact, setCurrentFunFact] = useState(0)

  const funFacts = [
    "Você sabia que o @initpedro é o criador do Kardio?",
    "Com o Kardio você consegue organizar qualquer tipo de projeto de forma simples e eficiente",
    "Você sabia que o Kardio é 100% gratuito e open source?",
    "Com o Kardio você pode criar projetos ilimitados sem nenhuma restrição",
    "Você sabia que o Kardio não coleta nenhum dado pessoal dos usuários?",
    "Com o Kardio você consegue gerenciar múltiplos projetos vinculados em um só lugar",
    "Você sabia que o @initpedro criou o Kardio para ser simples e poderoso?",
    "Com o Kardio você pode trabalhar em equipe gerenciando projetos pessoais vinculados",
    "Você sabia que o Kardio suporta projetos pessoais e gerenciais?",
    "Com o Kardio você consegue filtrar e organizar seus cards de forma inteligente",
    "Você sabia que o Kardio usa inteligência artificial para gerar projetos automaticamente?",
    "Com o Kardio você pode acessar seus projetos de qualquer dispositivo",
    "Você sabia que o @initpedro desenvolveu o Kardio pensando na experiência do usuário?",
    "Com o Kardio você consegue visualizar insights detalhados dos seus filtros",
    "Você sabia que o Kardio é otimizado para dispositivos móveis e desktop?",
    "Com o Kardio você pode salvar seus projetos favoritos para acesso rápido",
    "Você sabia que você pode contribuir com o desenvolvimento do Kardio no GitHub?",
    "Com o Kardio você consegue criar legendas personalizadas para organizar seus cards",
    "Você sabia que o Kardio foi criado para ser rápido e responsivo?",
    "Com o Kardio você pode compartilhar seus projetos com outras pessoas facilmente",
  ]

  useEffect(() => {
    if (!showFunFacts) return
    
    const interval = setInterval(() => {
      setCurrentFunFact((prev) => (prev + 1) % funFacts.length)
    }, 3500) // Troca a mensagem a cada 3.5 segundos

    return () => {
      clearInterval(interval)
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


