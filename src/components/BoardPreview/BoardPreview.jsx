import { useState } from 'react'
import './BoardPreview.css'

function BoardPreview() {
  const [activeTab, setActiveTab] = useState('video')

  return (
    <div className="board-preview-wrapper">
      <div className="board-preview-gradient"></div>
      <div className="board-preview-mockup">
        <div className="board-preview-header">
          <div className="board-preview-dots">
            <div className="board-preview-dot board-preview-dot-red"></div>
            <div className="board-preview-dot board-preview-dot-yellow"></div>
            <div className="board-preview-dot board-preview-dot-green"></div>
          </div>
          <div className="board-preview-tabs">
            <button
              className={`board-preview-tab ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              Vídeo
            </button>
            <button
              className={`board-preview-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Board Preview
            </button>
          </div>
        </div>
        <div className="board-preview-content">
          {activeTab === 'video' ? (
            <div className="board-preview-video-container">
              <iframe
                src="https://drive.google.com/file/d/13830znP_wO3jnwO3sWXl2GxL5OsAW9Sy/preview"
                width="100%"
                height="100%"
                allow="autoplay"
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  minHeight: '500px'
                }}
              ></iframe>
            </div>
          ) : (
            <div className="board-preview-board-content">
          <div className="board-preview-board">
            <div className="board-preview-column">
              <div className="board-preview-column-header">
                <h3 className="board-preview-column-title">Para Fazer</h3>
                <span className="board-preview-column-count">2</span>
              </div>
              <div className="board-preview-cards">
                <div className="board-preview-card">
                  <div className="board-preview-card-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                  <h4 className="board-preview-card-title">Design da landing page</h4>
                  <p className="board-preview-card-description">Criar wireframes e mockups</p>
                </div>
                <div className="board-preview-card">
                  <div className="board-preview-card-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                  <h4 className="board-preview-card-title">Revisar documentação</h4>
                </div>
              </div>
            </div>
            <div className="board-preview-column">
              <div className="board-preview-column-header">
                <h3 className="board-preview-column-title">Em Progresso</h3>
                <span className="board-preview-column-count">1</span>
              </div>
              <div className="board-preview-cards">
                <div className="board-preview-card">
                  <div className="board-preview-card-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                  <h4 className="board-preview-card-title">Implementar autenticação</h4>
                  <p className="board-preview-card-description">Integrar com Supabase</p>
                </div>
              </div>
            </div>
            <div className="board-preview-column">
              <div className="board-preview-column-header">
                <h3 className="board-preview-column-title">Concluído</h3>
                <span className="board-preview-column-count">1</span>
              </div>
              <div className="board-preview-cards">
                <div className="board-preview-card board-preview-card-completed">
                  <div className="board-preview-card-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                  <h4 className="board-preview-card-title">Configurar ambiente</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="board-preview-footer">
            <p className="board-preview-footer-text">Experimente todas as funcionalidades</p>
            <button className="board-preview-footer-button">
              Começar agora
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardPreview

