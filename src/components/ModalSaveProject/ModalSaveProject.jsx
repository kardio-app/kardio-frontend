import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { saveProject } from '../../utils/savedProjects';
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
      console.error('Erro ao salvar projeto:', error);
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
          <h3 className="modal-save-project-title">Salvar Projeto</h3>
          <button
            className="modal-save-project-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
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
              placeholder="Digite um nome para o projeto"
              autoFocus
            />
            {error && (
              <p className="modal-save-project-error">{error}</p>
            )}
          </div>

          <div className="modal-save-project-info">
            <p className="modal-save-project-code">
              <strong>Código:</strong> {projectCode}
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

