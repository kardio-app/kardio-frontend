import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { saveProject } from '../../utils/savedProjects';
import { safeError } from '../../utils/logger';
import './ModalSaveProject.css';

function ModalSaveProject({ isOpen, onClose, projectCode, projectName, encryptedLink }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(projectName || '');
      setError('');
    }
  }, [isOpen, projectName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Por favor, insira um nome para o projeto');
      return;
    }

    if (!projectCode) {
      setError('Código do projeto não encontrado');
      return;
    }

    try {
      saveProject({
        name: name.trim(),
        code: projectCode,
        encryptedLink: encryptedLink
      });
      onClose();
      // Mostrar mensagem de sucesso (pode usar toast se disponível)
      alert('Projeto salvo com sucesso!');
    } catch (error) {
      safeError('Erro ao salvar projeto:', error);
      setError('Erro ao salvar projeto. Tente novamente.');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-save-project-backdrop" onClick={handleBackdropClick}>
      <div className="modal-save-project-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-save-project-header">
          <div className="modal-save-project-header-content">
            <h3 className="modal-save-project-title">Salvar Projeto</h3>
            <p className="modal-save-project-description">
              Salve este projeto no seu histórico local para acessá-lo facilmente no futuro. Você poderá encontrá-lo na lista de projetos salvos sem precisar do código.
            </p>
          </div>
          <button
            className="modal-save-project-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form className="modal-save-project-form" onSubmit={handleSubmit}>
          <div className="modal-save-project-field">
            <label className="modal-save-project-label">Nome do Projeto</label>
            <input
              className="modal-save-project-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Ex: Meu Projeto Principal"
              autoFocus
            />
            {error && (
              <p className="modal-save-project-error">{error}</p>
            )}
            <p className="modal-save-project-hint">
              Escolha um nome descritivo para identificar este projeto facilmente
            </p>
          </div>

          <div className="modal-save-project-info">
            <p className="modal-save-project-info-label">Código do Projeto</p>
            <p className="modal-save-project-code">
              {projectCode}
            </p>
            <p className="modal-save-project-info-hint">
              Guarde este código caso precise acessar o projeto em outro dispositivo
            </p>
          </div>

          <div className="modal-save-project-actions">
            <button
              type="button"
              className="modal-save-project-button modal-save-project-button-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-save-project-button modal-save-project-button-submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ModalSaveProject;

