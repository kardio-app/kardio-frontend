import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import Navbar from '../components/Navbar/Navbar'
import BoardPreview from '../components/BoardPreview/BoardPreview'
import Loading from '../components/Loading/Loading'
import ScrollVelocity from '../components/ScrollVelocity/ScrollVelocity'
import ToastContainer from '../components/Toast/ToastContainer'
import ModalCreateProject from '../components/ModalCreateProject/ModalCreateProject'
import ModalAccess from '../components/ModalAccess/ModalAccess'
import AlternatingText from '../components/AlternatingText/AlternatingText'
import Testimonials from '../components/Testimonials/Testimonials'
import { useToast } from '../hooks/useToast'
import { createProject, createColumn, createCard, createLabel } from '../services/api'
import API_URL from '../config/api.js'
import { saveProject } from '../utils/savedProjects'
import { fixEncoding } from '../utils/fixEncoding'
import { safeError } from '../utils/logger'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast, hideToast, toasts } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [projectDescription, setProjectDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const notificationsShownRef = useRef(false)

  const scrollToBoardPreview = useCallback(() => {
    const boardPreviewSection = document.querySelector('.home-board-preview')
    if (boardPreviewSection) {
      boardPreviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    document.title = 'Kardio - Seu Kanban Profissional'
    // Scroll para o topo ao carregar a página
    window.scrollTo(0, 0)
    
    // Garantir que o scroll esteja habilitado na página Home
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.style.height = ''
    document.body.style.maxHeight = ''
    document.documentElement.style.height = ''
    document.documentElement.style.maxHeight = ''
    
    // Verificar se deve abrir o modal de criação
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true)
      // Remover o query param da URL
      setSearchParams({})
    }
    
    return () => {
      // Limpar estilos ao desmontar
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.height = ''
      document.body.style.maxHeight = ''
      document.documentElement.style.height = ''
      document.documentElement.style.maxHeight = ''
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    // Mostrar notificações apenas uma vez
    if (notificationsShownRef.current) return
    
    notificationsShownRef.current = true
    
    const showNotifications = async () => {
      try {
        // Buscar último commit
        const response = await fetch(
          'https://api.github.com/repos/kardio-app/kardio-frontend/commits?sha=main&per_page=1'
        )
        
        if (response.ok) {
          const commits = await response.json()
          if (commits.length > 0) {
            const lastCommit = commits[0]
            const commitMessage = lastCommit.commit.message.split('\n')[0]
            const fixedMessage = fixEncoding(commitMessage)
            const truncatedMessage = fixedMessage.length > 50 
              ? fixedMessage.substring(0, 50) + '...' 
              : fixedMessage
            
            // Notificação sobre atualização
            setTimeout(() => {
              showToast(`Confira a nova atualização: ${truncatedMessage}`, 'info', 6000)
            }, 1000)
          }
        }
      } catch (error) {
        safeError('Erro ao buscar último commit', error)
      }

      // Notificação sobre vídeo explicativo
      setTimeout(() => {
        showToast('Confira o vídeo explicativo!', 'info', 6000, scrollToBoardPreview)
      }, 2500)
    }

    showNotifications()
  }, [showToast, scrollToBoardPreview])

  useEffect(() => {
    if (isCreating && projectResult) {
      const timer = setTimeout(() => {
        if (projectResult.type === 'managerial') {
          navigate(`/board-gerencial/${projectResult.encryptedLink}`)
        } else {
          navigate(`/board/${projectResult.encryptedLink}`)
        }
        setIsCreating(false)
        setProjectResult(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isCreating, projectResult, navigate])

  const handleCreateBoard = () => {
    setShowCreateModal(true)
  }

  const handleAccessProject = () => {
    setShowAccessModal(true)
  }

  const handleCreateProjectConfirm = async (projectData) => {
    setShowCreateModal(false)
    setIsCreating(true)
    try {
      const linkedProjects = projectData.linkedProjects || []
      const result = await createProject(projectData.name, projectData.type, linkedProjects)
      setProjectResult(result)
      
      // Salvar automaticamente no localStorage para projetos pessoais e gerenciais
      try {
        saveProject({
          name: projectData.name,
          code: result.accessCode,
          encryptedLink: result.encryptedLink
        })

        // Salvar também os projetos pessoais vinculados criados
        if (result.linkedProjects && result.linkedProjects.length > 0) {
          result.linkedProjects.forEach(linkedProject => {
            try {
              saveProject({
                name: linkedProject.name,
                code: linkedProject.accessCode,
                encryptedLink: linkedProject.encryptedId
              })
            } catch (saveError) {
              safeError('Erro ao salvar projeto vinculado:', saveError)
            }
          })
        }
      } catch (saveError) {
        safeError('Erro ao salvar projeto automaticamente', saveError)
      }
    } catch (error) {
      safeError('Erro ao criar projeto', error)
      alert('Erro ao criar projeto. Tente novamente.')
      setIsCreating(false)
      setProjectResult(null)
    }
  }

  const handleCreateProjectCancel = () => {
    setShowCreateModal(false)
  }

  const generateProjectWithAI = async (description) => {
    try {
      setIsGenerating(true)
      
      // Chamar API do Gemini via backend
      const response = await fetch(`${API_URL}/ai/generate-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao gerar projeto com IA'
        let errorData = {}
        
        try {
          errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          safeError('Erro do backend ao gerar projeto')
        } catch (e) {
          const errorText = await response.text()
          safeError('Erro do backend ao gerar projeto (texto)')
          errorMessage = errorText || errorMessage
        }
        
        // Tratamento especial para rate limit (429)
        if (response.status === 429) {
          const waitTime = errorData.retryAfter 
            ? `${errorData.retryAfter} segundos` 
            : 'alguns minutos'
          errorMessage = `Quota da API excedida. Aguarde ${waitTime} antes de tentar novamente.`
        }
        
        throw new Error(errorMessage)
      }

      const aiResponse = await response.json()
      
      // Criar projeto
      const projectName = aiResponse.projectName || `Projeto: ${description.substring(0, 30)}`
      const result = await createProject(projectName, 'personal', [])
      
      // Salvar projeto
      saveProject({
        name: projectName,
        code: result.accessCode,
        encryptedLink: result.encryptedLink
      })

      // Criar labels primeiro (se houver)
      const labelsMap = {} // Mapear nome da label para ID
      const labels = aiResponse.labels || []
      
      for (const labelData of labels) {
        try {
          const label = await createLabel(result.encryptedLink, {
            name: labelData.name,
            color: labelData.color
          })
          labelsMap[labelData.name] = label.id
        } catch (error) {
          safeError('Erro ao criar label:', error)
          // Continuar mesmo se uma label falhar
        }
      }

      // Criar colunas e cards (limitado)
      const maxColumns = 5
      const maxCardsPerColumn = 4
      
      const columns = aiResponse.columns || []
      const limitedColumns = columns.slice(0, maxColumns)

      for (let i = 0; i < limitedColumns.length; i++) {
        const columnData = limitedColumns[i]
        
        // Mapear nomes de labels da coluna para IDs
        let columnLabelId = null
        if (Array.isArray(columnData.labelNames) && columnData.labelNames.length > 0) {
          // Usar a primeira label da coluna
          const firstLabelName = columnData.labelNames[0]
          if (labelsMap[firstLabelName]) {
            columnLabelId = labelsMap[firstLabelName]
          }
        }
        
        const column = await createColumn(
          result.encryptedLink, 
          columnData.name || `Coluna ${i + 1}`,
          columnLabelId
        )
        
        const cards = columnData.cards || []
        const limitedCards = cards.slice(0, maxCardsPerColumn)
        
        for (const cardData of limitedCards) {
          // Mapear nomes de labels para IDs
          const labelIds = []
          if (Array.isArray(cardData.labelNames)) {
            for (const labelName of cardData.labelNames) {
              if (labelsMap[labelName]) {
                labelIds.push(labelsMap[labelName])
              }
            }
          }
          
          // Usar primeira label como highlight se houver
          const highlightLabelId = labelIds.length > 0 ? labelIds[0] : null
          
          await createCard(result.encryptedLink, column.id, {
            title: cardData.title || 'Card',
            description: cardData.description || '',
            assignee: cardData.assignee || null,
            label_ids: labelIds,
            highlight_label_id: highlightLabelId,
            is_completed: cardData.is_completed === true // Preservar estado de conclusão do template
          })
        }
      }

      setProjectResult(result)
      setIsCreating(true)
      setProjectDescription('')
      showToast('Projeto gerado com sucesso!', 'success', 3000)
    } catch (error) {
      safeError('Erro ao gerar projeto', error)
      showToast('Erro ao gerar projeto. Tente novamente.', 'error', 5000)
      setIsGenerating(false)
    }
  }

  const handleGenerateProject = async (e) => {
    e.preventDefault()
    if (!projectDescription.trim() || isGenerating) return

    // Ativar imediatamente a tela de carregamento com mensagens intercaladas
    setIsCreating(true)
    setIsGenerating(true)

    await generateProjectWithAI(projectDescription.trim())
  }

  return (
    <>
      {isCreating && <Loading />}
      <Navbar />
      <div className="home">
        <section className="home-hero">
          <div className="home-hero-container">
            <div className="home-hero-content">
              <AlternatingText />
              <h1 className="home-title">
                Organize suas tarefas<br />
                <span className="home-title-highlight">gratuitamente</span>
              </h1>
              <p className="home-subtitle">
                Suas ideias 🚀 são <strong><em>impulsionadas</em></strong> com uma ferramenta simples e intuitiva para gerenciar tarefas e alcançar seus objetivos.
              </p>
              <div className="home-buttons-wrapper">
                <button 
                  className="home-button" 
                  onClick={handleAccessProject}
                  disabled={isCreating || isGenerating}
                >
                  Entrar em um projeto
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
                <button 
                  className="home-button-secondary" 
                  onClick={() => navigate('/docs')}
                >
                  Documentação
                </button>
              </div>
              
              <form onSubmit={handleGenerateProject} className="home-hero-input-wrapper">
                <input
                  type="text"
                  className="home-hero-input"
                  placeholder="Descreva seu projeto e a IA criará um Kanban pré-configurado..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isCreating || isGenerating}
                />
                <button
                  type="submit"
                  className="home-hero-input-button"
                  disabled={!projectDescription.trim() || isCreating || isGenerating}
                  title={isGenerating ? 'Gerando projeto...' : 'Criar projeto com IA'}
                >
                  {isGenerating ? (
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
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                  ) : (
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
                  )}
                </button>
              </form>
            </div>
            <motion.div 
              className="home-hero-preview"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <img 
                src="https://i.ibb.co/xt64Kswk/Captura-de-tela-2026-01-17-194307.png" 
                alt="Preview do Kardio" 
                className="home-hero-preview-image"
              />
            </motion.div>
          </div>
        </section>

        <Testimonials />

        <motion.section 
          className="home-board-preview"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="board-preview-wrapper">
            <BoardPreview />
          </div>
        </motion.section>

        <ScrollVelocity
          texts={['usekardio', 'usekardio', 'usekardio']}
          velocity={100}
          className="custom-scroll-text"
          numCopies={40}
        />

        <motion.section 
          className="home-creator-message"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="creator-message-container">
            <div className="creator-message-content">
              <div className="creator-message-image-wrapper">
                <img 
                  src="https://i.ibb.co/XfXNTmnw/Screenshot-1.png" 
                  alt="@initpedro" 
                  className="creator-message-image"
                />
              </div>
              <div className="creator-message-text-wrapper">
                <p className="creator-message-text">
                  O Kardio nasceu de uma necessidade real: criar uma ferramenta de gerenciamento de projetos que fosse simples, eficiente e verdadeiramente gratuita. Este é um projeto pessoal desenvolvido para solucionar problemas reais do dia a dia, e estou feliz em compartilhá-lo com vocês como projeto open source.
                </p>
                <p className="creator-message-text">
                  Minha intenção é que o Kardio ajude pessoas e equipes a organizarem seus projetos sem complicações desnecessárias. Se este projeto te ajudou de alguma forma, isso já é uma grande vitória para mim.
                </p>
                <p className="creator-message-signature">
                  — @initpedro
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="home-footer">
          <div className="footer-header">
            <div className="footer-header-content">
              <div className="footer-header-left">
                <h3 className="footer-header-title">@kardiosoftware</h3>
                <p className="footer-copyright">© 2026 @kardiosoftware</p>
              </div>
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
                  href="https://instagram.com/kardiosoftware" 
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
            </div>
          </div>
          <div className="footer-content">
            <div className="footer-column">
              <h4 className="footer-column-subtitle">Links Úteis</h4>
              <ul className="footer-links">
                <li><a href="/home" className="footer-link">Início</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend/issues" target="_blank" rel="noopener noreferrer" className="footer-link">Reportar Bug</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend/discussions" target="_blank" rel="noopener noreferrer" className="footer-link">Discussões</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="footer-link">README</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend/pulls" target="_blank" rel="noopener noreferrer" className="footer-link">Contribuir</a></li>
                <li><a href="https://github.com/kardio-app/kardio-frontend/releases" target="_blank" rel="noopener noreferrer" className="footer-link">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-column-subtitle">Documentação</h4>
              <ul className="footer-links">
                <li><a href="/docs" className="footer-link">Documentação</a></li>
                <li><a href="/docs#recursos" className="footer-link">Recursos</a></li>
                <li><a href="/docs#funcionalidades" className="footer-link">Funcionalidades</a></li>
                <li><a href="/docs#comecar" className="footer-link">Como Começar</a></li>
                <li><a href="/docs#kanban" className="footer-link">Sobre Kanban</a></li>
                <li><a href="/docs#guia-rapido" className="footer-link">Guia Rápido</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-column-subtitle">Suporte</h4>
              <ul className="footer-links">
                <li>
                  <a href="mailto:kardiosoftware@gmail.com" className="footer-link footer-link-email">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    kardiosoftware@gmail.com
                  </a>
                </li>
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
      <ToastContainer toasts={toasts} onClose={hideToast} />
      {showCreateModal && (
        <ModalCreateProject
          onConfirm={handleCreateProjectConfirm}
          onCancel={handleCreateProjectCancel}
        />
      )}
      {showAccessModal && (
        <ModalAccess onClose={() => setShowAccessModal(false)} />
      )}
    </>
  )
}

export default Home

