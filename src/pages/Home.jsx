import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import BoardPreview from '../components/BoardPreview/BoardPreview'
import Loading from '../components/Loading/Loading'
import { createProject } from '../services/api'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [projectResult, setProjectResult] = useState(null)

  useEffect(() => {
    document.title = '@kardio'
  }, [])

  useEffect(() => {
    if (isCreating && projectResult) {
      const timer = setTimeout(() => {
        navigate(`/board/${projectResult.encryptedLink}`)
        setIsCreating(false)
        setProjectResult(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isCreating, projectResult, navigate])

  const handleCreateBoard = async () => {
    setIsCreating(true)
    try {
      const result = await createProject('Novo Projeto')
      setProjectResult(result)
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto. Tente novamente.')
      setIsCreating(false)
      setProjectResult(null)
    }
  }

  return (
    <>
      {isCreating && <Loading />}
      <Navbar />
      <div className="home">
        <section className="home-hero">
          <div className="home-content">
            <p className="home-created-by">
              Criado por{' '}
              <a 
                href="https://www.instagram.com/initpedro/" 
                className="home-created-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                initpedro
              </a>
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
                className="home-external-icon"
              >
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              </svg>
            </p>
            <h1 className="home-title">
              Organize e faça<br />
              progresso <span className="home-title-highlight">gratuitamente</span>
            </h1>
            <p className="home-subtitle">
              Ferramentas simples para organizar seus projetos e alcançar seus objetivos.
            </p>
            <button 
              className="home-button" 
              onClick={handleCreateBoard}
              disabled={isCreating}
            >
              {isCreating ? 'Criando...' : 'Começar Agora'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="home-button-icon"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </section>

        <section className="home-board-preview">
          <div className="board-preview-wrapper">
            <BoardPreview />
          </div>
        </section>

        <section id="how-it-works" className="home-how-it-works">
          <div className="how-it-works-container">
            <h2 className="how-it-works-title">Como Funciona</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-card-header">
                  <div className="step-number">1</div>
                  <h3 className="step-title">Crie Seu Projeto</h3>
                </div>
                <p className="step-description">
                  Comece criando um novo projeto. Dê um nome e comece a organizar suas tarefas.
                </p>
              </div>
              <div className="step-card">
                <div className="step-card-header">
                  <div className="step-number">2</div>
                  <h3 className="step-title">Organize com Colunas</h3>
                </div>
                <p className="step-description">
                  Organize suas tarefas em colunas personalizáveis. 
                  Arraste e solte cards entre colunas conforme o progresso.
                </p>
              </div>
              <div className="step-card">
                <div className="step-card-header">
                  <div className="step-number">3</div>
                  <h3 className="step-title">Adicione Cards</h3>
                </div>
                <p className="step-description">
                  Crie cards para suas tarefas. Adicione descrições, responsáveis 
                  e mantenha tudo organizado.
                </p>
              </div>
              <div className="step-card">
                <div className="step-card-header">
                  <div className="step-number">4</div>
                  <h3 className="step-title">Colabore e Compartilhe</h3>
                </div>
                <p className="step-description">
                  Compartilhe seu projeto com sua equipe. Trabalhem juntos 
                  de forma simples e eficiente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-opensource">
          <div className="opensource-wrapper">
            <div className="opensource-container">
              <div className="opensource-content">
                <div className="opensource-icon-wrapper">
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
                    className="opensource-icon"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </div>
                <h3 className="opensource-title">Projeto Open Source</h3>
                <p className="opensource-description">
                  kardio é um projeto open source. Contribua com o desenvolvimento e ajude a melhorar a ferramenta.
                </p>
                <a 
                  href="https://github.com/initpedro" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="opensource-button"
                >
                  <span>Contribuir no GitHub</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="opensource-button-icon"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <div className="footer-content">
            <div className="footer-column">
              <h3 className="footer-column-title">@kardio</h3>
              <div className="footer-social-links">
                <a 
                  href="https://www.linkedin.com/in/initpedro/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  title="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a 
                  href="https://github.com/initpedro" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  title="GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/initpedro" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  title="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/5534998731732?text=Olá, kardio! Vim pelo seu Website e gostaria de saber mais!" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-social-link"
                  title="WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                    <path d="m21.854 2.147-10.94 10.939"></path>
                  </svg>
                </a>
              </div>
              <p className="footer-copyright">© 2025 @kardio</p>
            </div>
            <div className="footer-column">
              <h4 className="footer-column-subtitle">Links Úteis</h4>
              <ul className="footer-links">
                <li><a href="#how-it-works" className="footer-link">Como Funciona</a></li>
                <li><a href="/home" className="footer-link">Início</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-column-subtitle">Legal</h4>
              <ul className="footer-links">
                <li><a href="/privacidade" className="footer-link">Privacidade</a></li>
                <li><a href="/termos" className="footer-link">Termos</a></li>
                <li><a href="/cookies" className="footer-link">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-bottom-text">
                Desenvolvido <span className="footer-code">&lt;/&gt;</span> por{' '}
                <a href="https://instagram.com/initpedro" target="_blank" rel="noopener noreferrer" className="footer-bottom-link">
                  @initpedro
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Home

