import { motion } from 'motion/react'
import { useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import DocsCommits from '../components/DocsCommits/DocsCommits'
import DocsSidebar from '../components/DocsSidebar/DocsSidebar'
import DocsContent from '../components/DocsContent/DocsContent'
import { getDocTitleById } from '../utils/docsNavItems'
import { useDocsContext } from '../contexts/DocsContext'
import './Docs.css'

function Docs() {
  const { selectedTopic, setSelectedTopic, expandedItems, setExpandedItems, showOverview, setShowOverview } = useDocsContext()

  useEffect(() => {
    document.title = 'Documentação - Kardio'
    
    // Verificar se deve mostrar o overview baseado no localStorage
    const shouldShowOverview = localStorage.getItem('kardio-docs-show-overview')
    if (shouldShowOverview === 'true') {
      setShowOverview(true)
      setSelectedTopic(null)
      localStorage.removeItem('kardio-docs-show-overview')
    }
    
    return () => {
      document.title = 'Kardio'
    }
  }, [setShowOverview, setSelectedTopic])

  return (
    <>
      <Navbar />
      <div className="docs-page">
        <div className="docs-container">
          <motion.aside 
            className="docs-sidebar"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <DocsSidebar
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              showOverview={showOverview}
              setShowOverview={setShowOverview}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
            />
          </motion.aside>
          <motion.main 
            className="docs-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="docs-content-wrapper">
              {showOverview ? (
                <motion.div 
                  className="docs-overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <DocsCommits />
                </motion.div>
              ) : selectedTopic ? (
                <motion.div 
                  className="docs-article"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1>{getDocTitleById(selectedTopic)}</h1>
                  <DocsContent topicId={selectedTopic} />
                </motion.div>
              ) : (
                <motion.div 
                  className="docs-welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="docs-welcome-content">
                    <h1>Bem-vindo à Documentação do Kardio</h1>
                    <div className="docs-welcome-description">
                      <p>
                        O <strong>Kardio</strong> é uma ferramenta gratuita e open source para organização de projetos 
                        usando o método Kanban. Com ele, você pode criar boards personalizados, gerenciar cards, 
                        organizar colunas e acompanhar o progresso dos seus projetos de forma visual e intuitiva.
                      </p>
                      <p>
                        Além disso, o Kardio oferece funcionalidades avançadas como projetos gerenciais, 
                        onde você pode vincular múltiplos projetos pessoais e gerenciá-los de forma centralizada, 
                        facilitando o acompanhamento de equipes e múltiplos projetos simultaneamente.
                      </p>
                      <p>
                        Assista ao vídeo abaixo para entender melhor como funciona o Kardio e comece a organizar 
                        seus projetos de forma eficiente!
                      </p>
                    </div>
                    <div className="docs-welcome-video">
                      <div className="docs-video-wrapper">
                        <div className="docs-video-header">
                          <div className="docs-video-dots">
                            <div className="docs-video-dot docs-video-dot-red"></div>
                            <div className="docs-video-dot docs-video-dot-yellow"></div>
                            <div className="docs-video-dot docs-video-dot-green"></div>
                          </div>
                        </div>
                        <div className="docs-video-container">
                          <iframe
                            src="https://drive.google.com/file/d/13830znP_wO3jnwO3sWXl2GxL5OsAW9Sy/preview"
                            width="100%"
                            height="100%"
                            allow="autoplay; fullscreen"
                            className="docs-video-iframe"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.main>
        </div>
      </div>
    </>
  )
}

export default Docs

