import Navbar from '../components/Navbar/Navbar'
import DocsCommits from '../components/DocsCommits/DocsCommits'
import DocsSidebar from '../components/DocsSidebar/DocsSidebar'
import { getDocTitleById } from '../utils/docsNavItems'
import { useDocsContext } from '../contexts/DocsContext'
import './Docs.css'

function Docs() {
  const { selectedTopic, setSelectedTopic, expandedItems, setExpandedItems, showOverview, setShowOverview } = useDocsContext()

  return (
    <>
      <Navbar />
      <div className="docs-page">
        <div className="docs-container">
          <aside className="docs-sidebar">
            <DocsSidebar
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              showOverview={showOverview}
              setShowOverview={setShowOverview}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
            />
          </aside>
          <main className="docs-content">
            <div className="docs-content-wrapper">
              {showOverview ? (
                <div className="docs-overview">
                  <DocsCommits />
                </div>
              ) : selectedTopic ? (
                <div className="docs-article">
                  <h1>{getDocTitleById(selectedTopic)}</h1>
                  <p>Conteúdo da documentação será adicionado aqui...</p>
                </div>
              ) : (
                <div className="docs-welcome">
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
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Docs

