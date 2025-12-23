import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getSavedProjects, deleteSavedProject, updateSavedProjectName, saveProject } from '../../utils/savedProjects';
import { accessProject, getBoard, getProject } from '../../services/api';
import Loading from '../Loading/Loading';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import ModalConfirm from '../ModalConfirm/ModalConfirm';
import '../Header/Header.css';
import './SavedProjectsSidebar.css';

const maskCode = (code) => {
  if (!code || code.length < 2) return code;
  return code.substring(0, 2) + '****';
};

function SavedProjectsSidebar({ isOpen, onClose, onLoadProject, onExit, showToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [accessCode, setAccessCode] = useState(null);
  const [loadingAccessCode, setLoadingAccessCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveCode, setSaveCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const boardId = location.pathname.startsWith('/board/') 
    ? location.pathname.split('/board/')[1] 
    : null;

  const handleBackToHome = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/home');
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadAccessCode = async () => {
    if (!boardId) return;
    setLoadingAccessCode(true);
    try {
      const projectData = await getProject(boardId);
      setAccessCode(projectData.accessCode);
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error);
    } finally {
      setLoadingAccessCode(false);
    }
  };

  const handleShare = async () => {
    setShowShareModal(true);
    setLoadingAccessCode(true);
    
    try {
      const projectData = await getProject(boardId);
      setAccessCode(projectData.accessCode);
    } catch (error) {
      console.error('Erro ao buscar código de acesso:', error);
    } finally {
      setLoadingAccessCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (accessCode) {
      try {
        await navigator.clipboard.writeText(accessCode);
        setCopied(true);
        if (showToast) {
          showToast('Código copiado!', 'success');
        }
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar código:', error);
        if (showToast) {
          showToast('Erro ao copiar código', 'error');
        }
      }
    }
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setAccessCode(null);
    setCopied(false);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    
    if (!saveCode.trim()) {
      setSaveError('Por favor, insira um código');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const result = await accessProject(saveCode.trim().toUpperCase());
      
      // Salvar no localStorage
      saveProject({
        name: result.name || 'Projeto sem nome',
        code: saveCode.trim().toUpperCase(),
        encryptedLink: result.encryptedLink
      });

      // Limpar input e recarregar lista
      setSaveCode('');
      loadProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      setSaveError(error.message || 'Código inválido');
    } finally {
      setIsSaving(false);
    }
  };

  const loadProjects = () => {
    const saved = getSavedProjects();
    setProjects(saved);
  };

  const handleLoadProject = async (project) => {
    setIsLoading(true);
    try {
      // Usar a mesma lógica do ModalAccess
      const result = await accessProject(project.code);
      
      // Atualizar projeto salvo (caso o nome tenha mudado)
      try {
        saveProject({
          name: result.name || project.name,
          code: project.code,
          encryptedLink: result.encryptedLink
        });
      } catch (saveError) {
        console.error('Erro ao atualizar projeto salvo:', saveError);
        // Continua mesmo se falhar o salvamento
      }
      
      // Pré-carregar dados do board
      try {
        const boardData = await getBoard(result.encryptedLink);
        sessionStorage.setItem(`board_preload_${result.encryptedLink}`, JSON.stringify(boardData));
      } catch (boardError) {
        console.error('Erro ao pré-carregar board:', boardError);
      }
      
      // Navegar para o board
      navigate(`/board/${result.encryptedLink}`);
      onClose();
      
      if (onLoadProject) {
        onLoadProject(project);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      alert('Erro ao carregar projeto. Verifique se o código ainda é válido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete && deleteSavedProject(projectToDelete.id)) {
      loadProjects();
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleStartEdit = (e, project) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (e, projectId) => {
    e.stopPropagation();
    if (editName.trim()) {
      if (updateSavedProjectName(projectId, editName.trim())) {
        loadProjects();
        setEditingId(null);
        setEditName('');
      }
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen) {
        const sidebar = document.querySelector('.saved-projects-sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          // Verificar se não é um modal aberto
          const modals = document.querySelectorAll('.modal-confirm-backdrop, .share-modal-overlay');
          const isClickOnModal = Array.from(modals).some(modal => modal.contains(event.target));
          
          // Verificar se o click foi no botão de menu (evita conflito)
          // O stopPropagation no botão já previne que o evento chegue aqui, mas verificamos por segurança
          const menuButton = event.target.closest('.navbar-menu-button, .navbar-mobile-link, .navbar-mobile-toggle');
          if (menuButton) {
            return; // Não fechar se o click foi no botão de menu
          }
          
          if (!isClickOnModal) {
            onClose();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isLoading && createPortal(
        <Loading message="Carregando projeto..." />,
        document.body
      )}
      <div className={`saved-projects-sidebar ${isOpen ? 'saved-projects-sidebar-open' : ''}`}>
          <div className="saved-projects-header">
            <h3 className="saved-projects-title">Configurações</h3>
            <button
              className="saved-projects-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="saved-projects-actions">
            <div className="saved-projects-theme">
              <ThemeToggle />
            </div>
            {boardId && (
              <button
                className="saved-projects-copy-button"
                onClick={handleShare}
                title="Compartilhar projeto"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Compartilhar
              </button>
            )}
            <button
              className="saved-projects-back-button"
              onClick={handleBackToHome}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Voltar para Home
            </button>
          </div>

          <div className="saved-projects-list">
            <form className="saved-projects-save-form" onSubmit={handleSaveProject}>
              <input
                type="text"
                className="saved-projects-save-input"
                placeholder="Insira o código aqui para salvar localmente"
                value={saveCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 6);
                  setSaveCode(value);
                  setSaveError('');
                }}
                maxLength={6}
                disabled={isSaving}
              />
              <button
                type="submit"
                className="saved-projects-save-button"
                disabled={isSaving || !saveCode.trim()}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              {saveError && (
                <p className="saved-projects-save-error">{saveError}</p>
              )}
            </form>
            {projects.length > 0 && (
              <div className="saved-projects-items">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="saved-project-item"
                    onClick={() => handleLoadProject(project)}
                  >
                  {editingId === project.id ? (
                    <div className="saved-project-edit" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        className="saved-project-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(e, project.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit(e);
                          }
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="saved-project-edit-actions">
                        <button
                          className="saved-project-edit-save"
                          onClick={(e) => handleSaveEdit(e, project.id)}
                        >
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
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button
                          className="saved-project-edit-cancel"
                          onClick={handleCancelEdit}
                        >
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
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="saved-project-content">
                        <div className="saved-project-icon">
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
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                            <path d="M9 3v18"></path>
                            <path d="M9 12h6"></path>
                          </svg>
                        </div>
                        <div className="saved-project-info">
                          <p className="saved-project-name">{project.name}</p>
                          <p className="saved-project-code">Código: {maskCode(project.code)}</p>
                        </div>
                      </div>
                      <div className="saved-project-actions">
                        <svg
                          className="saved-project-enter-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                        <button
                          className="saved-project-edit-btn"
                          onClick={(e) => handleStartEdit(e, project)}
                          aria-label="Editar nome"
                        >
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
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="saved-project-delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(e, project);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-label="Remover"
                        >
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
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
      {showDeleteModal && createPortal(
        <ModalConfirm
          title="Remover Projeto do Histórico Local?"
          message={`Tem certeza que deseja remover o projeto "${projectToDelete?.name}" do seu histórico local? Esta ação apenas remove o projeto da lista de projetos salvos localmente e não afeta o projeto no servidor. Você poderá acessá-lo novamente usando o código do projeto.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Remover Localmente"
          cancelText="Cancelar"
        />,
        document.body
      )}
      {showShareModal && createPortal(
        <div className="share-modal-overlay" onClick={handleCloseShareModal}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Compartilhar Projeto</h2>
              <button className="share-modal-close" onClick={handleCloseShareModal}>
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <p className="share-modal-label">Código de Acesso:</p>
              {loadingAccessCode ? (
                <div className="share-modal-loading">Carregando...</div>
              ) : accessCode ? (
                <div className="share-modal-code-container">
                  <button
                    className="share-modal-code"
                    onClick={handleCopyCode}
                    title="Clique para copiar"
                  >
                    {accessCode}
                  </button>
                  <button
                    className="share-modal-copy-button"
                    onClick={handleCopyCode}
                    title="Copiar código"
                  >
                    {copied ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"></path>
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="share-modal-error">Erro ao carregar código</div>
              )}
              <p className="share-modal-hint">
                Compartilhe este código para que outras pessoas possam acessar o projeto
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default SavedProjectsSidebar;

